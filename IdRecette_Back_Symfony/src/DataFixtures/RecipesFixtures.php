<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Recipe;
use App\Entity\Instruction;
use App\Entity\Ingredient;
use App\Entity\User;
use App\Entity\Type;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class RecipesFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $type = $this->getReference('type-Breakfast');

        $recipe = new Recipe();
        $recipe->setTitle('Pancakes');
        $recipe->setDuration(20);
        $recipe->setDifficulty(1);
        $recipe->setImage('pancakes.jpg');
        $recipe->setUpdatedAt(new \DateTimeImmutable());
        $recipe->setRate(4);
        $recipe->setType($type);

        $instruction = new Instruction();
        $instruction->setStepNumber(1);
        $instruction->setStep('Mix the flour and eggs');
        $instruction->setRecipe($recipe);
        $recipe->addInstruction($instruction);

        $category = new Category();
        $category->setName('Breakfast');
        $manager->persist($category);

        $ingredient1 = new Ingredient();
        $ingredient1->setName('Flour');
        $ingredient1->setAllergen(false);
        $ingredient1->setCategory($category);
        $recipe->addIngredient($ingredient1);

        $ingredient2 = new Ingredient();
        $ingredient2->setName('Eggs');
        $ingredient2->setAllergen(false);
        $ingredient2->setCategory($category);
        $recipe->addIngredient($ingredient2);

        $manager->persist($recipe);
        $manager->persist($instruction);
        $manager->persist($ingredient1);
        $manager->persist($ingredient2);
        $manager->flush();
    }

    public function getDependencies()
    {
        return [
            TypeFixtures::class,
        ];
    }
}