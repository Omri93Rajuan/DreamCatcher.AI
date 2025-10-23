import chalk from "chalk";

import seedDreams from "./seedDreams";
import seedUsers from "./seedUsers";

export async function runSeeding() {
  try {
    await seedDreams();
    await seedUsers();

    console.log(
      chalk.bgMagenta.white.bold(" Database seeding completed successfully ")
    );
  } catch (error) {
    console.error(chalk.bgRed.white.bold(" Seeding failed: "), error);
  }
}

export default runSeeding;
