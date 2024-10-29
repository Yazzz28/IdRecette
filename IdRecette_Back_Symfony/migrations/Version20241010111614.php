<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241010111614 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE category (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE diet (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(150) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE diet_user (diet_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_778B024CE1E13ACE (diet_id), INDEX IDX_778B024CA76ED395 (user_id), PRIMARY KEY(diet_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE ingredient (id INT AUTO_INCREMENT NOT NULL, category_id INT NOT NULL, name VARCHAR(255) NOT NULL, is_allergen TINYINT(1) NOT NULL, INDEX IDX_6BAF787012469DE2 (category_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE instruction (id INT AUTO_INCREMENT NOT NULL, recipe_id INT NOT NULL, step_number INT NOT NULL, step LONGTEXT NOT NULL, INDEX IDX_7BBAE15659D8A214 (recipe_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE recipe (id INT AUTO_INCREMENT NOT NULL, type_id INT NOT NULL, title VARCHAR(255) NOT NULL, duration INT NOT NULL, difficulty INT NOT NULL, image VARCHAR(255) NOT NULL, updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', rate INT DEFAULT NULL, INDEX IDX_DA88B137C54C8C93 (type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE recipe_ingredient (recipe_id INT NOT NULL, ingredient_id INT NOT NULL, INDEX IDX_22D1FE1359D8A214 (recipe_id), INDEX IDX_22D1FE13933FE08C (ingredient_id), PRIMARY KEY(recipe_id, ingredient_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE refresh_tokens (id INT AUTO_INCREMENT NOT NULL, refresh_token VARCHAR(128) NOT NULL, username VARCHAR(255) NOT NULL, valid DATETIME NOT NULL, UNIQUE INDEX UNIQ_9BACE7E1C74F2195 (refresh_token), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE type (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE unit (id INT AUTO_INCREMENT NOT NULL, unit VARCHAR(100) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE unit_volum (unit_id INT NOT NULL, volum_id INT NOT NULL, INDEX IDX_7841D93EF8BD700D (unit_id), INDEX IDX_7841D93E6CABE810 (volum_id), PRIMARY KEY(unit_id, volum_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, pseudo VARCHAR(50) NOT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_category (user_id INT NOT NULL, category_id INT NOT NULL, INDEX IDX_E6C1FDC1A76ED395 (user_id), INDEX IDX_E6C1FDC112469DE2 (category_id), PRIMARY KEY(user_id, category_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_recipe (user_id INT NOT NULL, recipe_id INT NOT NULL, INDEX IDX_BFDAAA0AA76ED395 (user_id), INDEX IDX_BFDAAA0A59D8A214 (recipe_id), PRIMARY KEY(user_id, recipe_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE volum (id INT AUTO_INCREMENT NOT NULL, volum INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE volum_ingredient (volum_id INT NOT NULL, ingredient_id INT NOT NULL, INDEX IDX_A29792476CABE810 (volum_id), INDEX IDX_A2979247933FE08C (ingredient_id), PRIMARY KEY(volum_id, ingredient_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE diet_user ADD CONSTRAINT FK_778B024CE1E13ACE FOREIGN KEY (diet_id) REFERENCES diet (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE diet_user ADD CONSTRAINT FK_778B024CA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE ingredient ADD CONSTRAINT FK_6BAF787012469DE2 FOREIGN KEY (category_id) REFERENCES category (id)');
        $this->addSql('ALTER TABLE instruction ADD CONSTRAINT FK_7BBAE15659D8A214 FOREIGN KEY (recipe_id) REFERENCES recipe (id)');
        $this->addSql('ALTER TABLE recipe ADD CONSTRAINT FK_DA88B137C54C8C93 FOREIGN KEY (type_id) REFERENCES type (id)');
        $this->addSql('ALTER TABLE recipe_ingredient ADD CONSTRAINT FK_22D1FE1359D8A214 FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE recipe_ingredient ADD CONSTRAINT FK_22D1FE13933FE08C FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE unit_volum ADD CONSTRAINT FK_7841D93EF8BD700D FOREIGN KEY (unit_id) REFERENCES unit (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE unit_volum ADD CONSTRAINT FK_7841D93E6CABE810 FOREIGN KEY (volum_id) REFERENCES volum (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_category ADD CONSTRAINT FK_E6C1FDC1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_category ADD CONSTRAINT FK_E6C1FDC112469DE2 FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_recipe ADD CONSTRAINT FK_BFDAAA0AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_recipe ADD CONSTRAINT FK_BFDAAA0A59D8A214 FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE volum_ingredient ADD CONSTRAINT FK_A29792476CABE810 FOREIGN KEY (volum_id) REFERENCES volum (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE volum_ingredient ADD CONSTRAINT FK_A2979247933FE08C FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE diet_user DROP FOREIGN KEY FK_778B024CE1E13ACE');
        $this->addSql('ALTER TABLE diet_user DROP FOREIGN KEY FK_778B024CA76ED395');
        $this->addSql('ALTER TABLE ingredient DROP FOREIGN KEY FK_6BAF787012469DE2');
        $this->addSql('ALTER TABLE instruction DROP FOREIGN KEY FK_7BBAE15659D8A214');
        $this->addSql('ALTER TABLE recipe DROP FOREIGN KEY FK_DA88B137C54C8C93');
        $this->addSql('ALTER TABLE recipe_ingredient DROP FOREIGN KEY FK_22D1FE1359D8A214');
        $this->addSql('ALTER TABLE recipe_ingredient DROP FOREIGN KEY FK_22D1FE13933FE08C');
        $this->addSql('ALTER TABLE unit_volum DROP FOREIGN KEY FK_7841D93EF8BD700D');
        $this->addSql('ALTER TABLE unit_volum DROP FOREIGN KEY FK_7841D93E6CABE810');
        $this->addSql('ALTER TABLE user_category DROP FOREIGN KEY FK_E6C1FDC1A76ED395');
        $this->addSql('ALTER TABLE user_category DROP FOREIGN KEY FK_E6C1FDC112469DE2');
        $this->addSql('ALTER TABLE user_recipe DROP FOREIGN KEY FK_BFDAAA0AA76ED395');
        $this->addSql('ALTER TABLE user_recipe DROP FOREIGN KEY FK_BFDAAA0A59D8A214');
        $this->addSql('ALTER TABLE volum_ingredient DROP FOREIGN KEY FK_A29792476CABE810');
        $this->addSql('ALTER TABLE volum_ingredient DROP FOREIGN KEY FK_A2979247933FE08C');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE diet');
        $this->addSql('DROP TABLE diet_user');
        $this->addSql('DROP TABLE ingredient');
        $this->addSql('DROP TABLE instruction');
        $this->addSql('DROP TABLE recipe');
        $this->addSql('DROP TABLE recipe_ingredient');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE type');
        $this->addSql('DROP TABLE unit');
        $this->addSql('DROP TABLE unit_volum');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE user_category');
        $this->addSql('DROP TABLE user_recipe');
        $this->addSql('DROP TABLE volum');
        $this->addSql('DROP TABLE volum_ingredient');
    }
}
