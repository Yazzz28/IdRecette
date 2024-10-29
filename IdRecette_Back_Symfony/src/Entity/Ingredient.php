<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\IngredientRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: IngredientRepository::class)]
#[ApiResource]
class Ingredient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?bool $isAllergen = null;

    #[ORM\ManyToOne(inversedBy: 'ingredient')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Category $category = null;

    /**
     * @var Collection<int, Volum>
     */
    #[ORM\ManyToMany(targetEntity: Volum::class, mappedBy: 'ingredient')]
    private Collection $volums;

    /**
     * @var Collection<int, Recipe>
     */
    #[ORM\ManyToMany(targetEntity: Recipe::class, mappedBy: 'ingredient')]
    private Collection $recipes;

    public function __construct()
    {
        $this->volums = new ArrayCollection();
        $this->recipes = new ArrayCollection();
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

    public function isAllergen(): ?bool
    {
        return $this->isAllergen;
    }

    public function setAllergen(bool $isAllergen): static
    {
        $this->isAllergen = $isAllergen;

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

    /**
     * @return Collection<int, Volum>
     */
    public function getVolums(): Collection
    {
        return $this->volums;
    }

    public function addVolum(Volum $volum): static
    {
        if (!$this->volums->contains($volum)) {
            $this->volums->add($volum);
            $volum->addIngredient($this);
        }

        return $this;
    }

    public function removeVolum(Volum $volum): static
    {
        if ($this->volums->removeElement($volum)) {
            $volum->removeIngredient($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, Recipe>
     */
    public function getRecipes(): Collection
    {
        return $this->recipes;
    }

    public function addRecipe(Recipe $recipe): static
    {
        if (!$this->recipes->contains($recipe)) {
            $this->recipes->add($recipe);
            $recipe->addIngredient($this);
        }

        return $this;
    }

    public function removeRecipe(Recipe $recipe): static
    {
        if ($this->recipes->removeElement($recipe)) {
            $recipe->removeIngredient($this);
        }

        return $this;
    }
}
