<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\TypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TypeRepository::class)]
#[ApiResource]
class Type
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    /**
     * @var Collection<int, recipe>
     */
    #[ORM\OneToMany(targetEntity: Recipe::class, mappedBy: 'type')]
    private Collection $recipe;

    public function __construct()
    {
        $this->recipe = new ArrayCollection();
    }

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

    /**
     * @return Collection<int, recipe>
     */
    public function getRecipe(): Collection
    {
        return $this->recipe;
    }

    public function addRecipe(recipe $recipe): static
    {
        if (!$this->recipe->contains($recipe)) {
            $this->recipe->add($recipe);
            $recipe->setType($this);
        }

        return $this;
    }

    public function removeRecipe(recipe $recipe): static
    {
        if ($this->recipe->removeElement($recipe)) {
            // set the owning side to null (unless already changed)
            if ($recipe->getType() === $this) {
                $recipe->setType(null);
            }
        }

        return $this;
    }
}
