<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\VolumRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VolumRepository::class)]
#[ApiResource]
class Volum
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $volum = null;

    /**
     * @var Collection<int, ingredient>
     */
    #[ORM\ManyToMany(targetEntity: Ingredient::class, inversedBy: 'volums')]
    private Collection $ingredient;

    /**
     * @var Collection<int, Unit>
     */
    #[ORM\ManyToMany(targetEntity: Unit::class, mappedBy: 'volum')]
    private Collection $units;

    public function __construct()
    {
        $this->ingredient = new ArrayCollection();
        $this->units = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getVolum(): ?int
    {
        return $this->volum;
    }

    public function setVolum(int $volum): static
    {
        $this->volum = $volum;

        return $this;
    }

    /**
     * @return Collection<int, ingredient>
     */
    public function getIngredient(): Collection
    {
        return $this->ingredient;
    }

    public function addIngredient(ingredient $ingredient): static
    {
        if (!$this->ingredient->contains($ingredient)) {
            $this->ingredient->add($ingredient);
        }

        return $this;
    }

    public function removeIngredient(ingredient $ingredient): static
    {
        $this->ingredient->removeElement($ingredient);

        return $this;
    }

    /**
     * @return Collection<int, Unit>
     */
    public function getUnits(): Collection
    {
        return $this->units;
    }

    public function addUnit(Unit $unit): static
    {
        if (!$this->units->contains($unit)) {
            $this->units->add($unit);
            $unit->addVolum($this);
        }

        return $this;
    }

    public function removeUnit(Unit $unit): static
    {
        if ($this->units->removeElement($unit)) {
            $unit->removeVolum($this);
        }

        return $this;
    }
}
