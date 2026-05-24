<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Serializer\SerializerInterface;

class ProductPersistProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly RequestStack $requestStack,
        private readonly SerializerInterface $serializer,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Product
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            throw new BadRequestHttpException('No request found');
        }

        $isUpdate = isset($uriVariables['id']);
        $contentType = $request->headers->get('Content-Type', '');
        $isMultipart = str_starts_with($contentType, 'multipart/form-data');

        if ($isUpdate) {
            $product = $this->em->find(Product::class, $uriVariables['id']);
            if (!$product) {
                throw new BadRequestHttpException('Product not found');
            }
        } else {
            $product = new Product();
        }

        if ($isMultipart) {
            $product->setName($request->request->get('name'));
            $product->setDescription($request->request->get('description'));
            $product->setQuantity((int) $request->request->get('quantity'));
            $product->setPrice((string) $request->request->get('price'));

            $categoryIri = $request->request->get('category');
            if ($categoryIri && preg_match('#/api/categories/(\d+)#', $categoryIri, $matches)) {
                $category = $this->em->find(\App\Entity\Category::class, (int) $matches[1]);
                $product->setCategory($category);
            } elseif (!$categoryIri) {
                $product->setCategory(null);
            }

            $uploadedFile = $request->files->get('imageFile');
            if ($uploadedFile) {
                $product->setImageFile($uploadedFile);
            }
        } else {
            $format = $request->getContentTypeFormat() ?: 'json';
            $this->serializer->deserialize(
                $request->getContent(),
                Product::class,
                $format,
                ['object_to_populate' => $product, 'groups' => ['product:write']]
            );
        }

        $this->em->persist($product);
        $this->em->flush();

        return $product;
    }
}
