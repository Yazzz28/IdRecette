<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\Symfony\Action\NotFoundAction;
use App\Controller\AuthController;
use App\Controller\MeController;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ApiResource(
    operations: [
        new Get(
            controller: NotFoundAction::class,
            openapi: new Operation(
                summary: 'hidden',
                description: 'hidden',
            )
        ),
        new Get(
            uriTemplate: '/me',
            controller: MeController::class,
            openapi: new Operation(
                security: [['bearerAuth' => []]],
            ),
            paginationEnabled: false,
            read: false,
            name: 'me'
        ),
        new Post(
            uriTemplate: '/auth',
            controller: AuthController::class,
        )
    ],
    normalizationContext: ['groups' => ['user:read']],
    security: 'is_granted("ROLE_USER")',
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups(['user:read'])]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read'])]
    private ?string $pseudo = null;

    /**
     * @var Collection<int, Diet>
     */
    #[Groups(['user:read'])]
    #[ORM\ManyToMany(targetEntity: Diet::class, mappedBy: 'users')]
    private Collection $diets;

    /**
     * @var Collection<int, category>
     */
    #[Groups(['user:read'])]
    #[ORM\ManyToMany(targetEntity: Category::class)]
    private Collection $allergy;

    /**
     * @var Collection<int, recipe>
     */
    #[Groups(['user:read'])]
    #[ORM\ManyToMany(targetEntity: Recipe::class, inversedBy: 'users')]
    private Collection $favorite;

    public function __construct()
    {
        $this->diets = new ArrayCollection();
        $this->allergy = new ArrayCollection();
        $this->favorite = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): static
    {
        $this->pseudo = $pseudo;

        return $this;
    }

    /**
     * @return Collection<int, Diet>
     */
    public function getDiets(): Collection
    {
        return $this->diets;
    }

    public function addDiet(Diet $diet): static
    {
        if (!$this->diets->contains($diet)) {
            $this->diets->add($diet);
            $diet->addUser($this);
        }

        return $this;
    }

    public function removeDiet(Diet $diet): static
    {
        if ($this->diets->removeElement($diet)) {
            $diet->removeUser($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, category>
     */
    public function getAllergy(): Collection
    {
        return $this->allergy;
    }

    public function addAllergy(category $allergy): static
    {
        if (!$this->allergy->contains($allergy)) {
            $this->allergy->add($allergy);
        }

        return $this;
    }

    public function removeAllergy(category $allergy): static
    {
        $this->allergy->removeElement($allergy);

        return $this;
    }

    /**
     * @return Collection<int, recipe>
     */
    public function getFavorite(): Collection
    {
        return $this->favorite;
    }

    public function addFavorite(recipe $favorite): static
    {
        if (!$this->favorite->contains($favorite)) {
            $this->favorite->add($favorite);
        }

        return $this;
    }

    public function removeFavorite(recipe $favorite): static
    {
        $this->favorite->removeElement($favorite);

        return $this;
    }
}
