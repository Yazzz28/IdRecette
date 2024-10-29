<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\UnitRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UnitRepository::class)]
#[ApiResource]
class Unit
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $unit = null;

    /**
     * @var Collection<int, volum>
     */
    #[ORM\ManyToMany(targetEntity: Volum::class, inversedBy: 'units')]
    private Collection $volum;

    public function __construct()
    {
        $this->volum = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUnit(): ?string
    {
        return $this->unit;
    }

    public function setUnit(string $unit): static
    {
        $this->unit = $unit;

        return $this;
    }

    /**
     * @return Collection<int, volum>
     */
    public function getVolum(): Collection
    {
        return $this->volum;
    }

    public function addVolum(volum $volum): static
    {
        if (!$this->volum->contains($volum)) {
            $this->volum->add($volum);
        }

        return $this;
    }

    public function removeVolum(volum $volum): static
    {
        $this->volum->removeElement($volum);

        return $this;
    }
}
