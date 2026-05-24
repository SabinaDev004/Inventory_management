<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ProductRepository;
use App\State\ProductPersistProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as Mapping;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[Mapping\Entity(repositoryClass: ProductRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['product:read']],
    denormalizationContext: ['groups' => ['product:write']],
    operations: [
        new Get(),
        new GetCollection(),
        new Post(
            deserialize: false,
            read: false,
            inputFormats: ['multipart' => ['multipart/form-data']],
            processor: ProductPersistProcessor::class,
        ),
        new Put(
            deserialize: false,
            read: false,
            inputFormats: ['jsonld' => ['application/ld+json'], 'json' => ['application/json'], 'multipart' => ['multipart/form-data']],
            processor: ProductPersistProcessor::class,
        ),
        new Delete(),
    ]
)]
#[Vich\Uploadable]
class Product
{
    #[Mapping\Id]
    #[Mapping\GeneratedValue]
    #[Mapping\Column]
    #[Groups(['product:read'])]
    private ?int $id = null;

    #[Mapping\Column(length: 255)]
    #[Assert\NotBlank(message: "El nombre no puede estar vacío.")]
    #[Groups(['product:read', 'product:write'])]
    private ?string $name = null;

    #[Mapping\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?string $description = null;

    #[Mapping\Column]
    #[Assert\NotNull(message: "La cantidad es obligatoria.")]
    #[Assert\PositiveOrZero(message: "La cantidad no puede ser negativa.")]
    #[Groups(['product:read', 'product:write'])]
    private ?int $quantity = null;

    #[Mapping\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Assert\NotBlank(message: "El precio es obligatorio.")]
    #[Assert\Positive(message: "El precio debe ser mayor que cero.")]
    #[Groups(['product:read', 'product:write'])]
    private ?string $price = null;

    #[Mapping\ManyToOne(inversedBy: 'products')]
    #[Groups(['product:read', 'product:write'])]
    private ?Category $category = null;

    #[Vich\UploadableField(mapping: 'products', fileNameProperty: 'imageName')]
    #[Groups(['product:write'])]
    private ?File $imageFile = null;

    #[Mapping\Column(nullable: true)]
    #[Groups(['product:read'])]
    private ?string $imageName = null;

    #[Mapping\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(string $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function setImageFile(?File $imageFile = null): void
    {
        $this->imageFile = $imageFile;

        if (null !== $imageFile) {
            $this->updatedAt = new \DateTimeImmutable();
        }
    }

    public function getImageFile(): ?File
    {
        return $this->imageFile;
    }

    public function setImageName(?string $imageName): void
    {
        $this->imageName = $imageName;
    }

    public function getImageName(): ?string
    {
        return $this->imageName;
    }
}
