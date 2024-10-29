<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\RecipeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RecipeRepository::class)]
#[ApiResource]
class Recipe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column]
    private ?int $duration = null;

    #[ORM\Column]
    private ?int $difficulty = null;

    #[ORM\Column(length: 255)]
    private ?string $image = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(nullable: true)]
    private ?int $rate = null;

    #[ORM\ManyToOne(inversedBy: 'recipe')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Type $type = null;

    /**
     * @var Collection<int, Instruction>
     */
    #[ORM\OneToMany(targetEntity: Instruction::class, mappedBy: 'recipe', orphanRemoval: true)]
    private Collection $instructions;

    /**
     * @var Collection<int, Ingredient>
     */
    #[ORM\ManyToMany(targetEntity: Ingredient::class, inversedBy: 'recipes')]
    private Collection $ingredient;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'favorite')]
    private Collection $users;

    public function __construct()
    {
        $this->instructions = new ArrayCollection();
        $this->ingredient = new ArrayCollection();
        $this->users = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getDifficulty(): ?int
    {
        return $this->difficulty;
    }

    public function setDifficulty(int $difficulty): static
    {
        $this->difficulty = $difficulty;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(string $image): static
    {
        $this->image = $image;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getRate(): ?int
    {
        return $this->rate;
    }

    public function setRate(?int $rate): static
    {
        $this->rate = $rate;

        return $this;
    }

    public function getType(): ?Type
    {
        return $this->type;
    }

    public function setType(?Type $type): static
    {
        $this->type = $type;

        return $this;
    }

    /**
     * @return Collection<int, Instruction>
     */
    public function getInstructions(): Collection
    {
        return $this->instructions;
    }

    public function addInstruction(Instruction $instruction): static
    {
        if (!$this->instructions->contains($instruction)) {
            $this->instructions->add($instruction);
            $instruction->setRecipe($this);
        }

        return $this;
    }

    public function removeInstruction(Instruction $instruction): static
    {
        if ($this->instructions->removeElement($instruction)) {
            // set the owning side to null (unless already changed)
            if ($instruction->getRecipe() === $this) {
                $instruction->setRecipe(null);
            }
        }

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
     * @return Collection<int, User>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->addFavorite($this);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        if ($this->users->removeElement($user)) {
            $user->removeFavorite($this);
        }

        return $this;
    }
}
