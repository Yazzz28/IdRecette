<?php

namespace App\DataFixtures;

use App\Entity\Type;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TypeFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $types = [
            'Breakfast',
            'Lunch',
            'Dinner',
            'Dessert',
            'Appetizer',
            'Snack',
        ];

        foreach ($types as $typeName) {
            $type = new Type();
            $type->setName($typeName);
            $manager->persist($type);
            $this->addReference('type-' . $typeName, $type);
        }

        $manager->flush();
    }
}