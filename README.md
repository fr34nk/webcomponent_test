# Web Component Test

## What it uses

  - Bootstrap
  - Web Components

## How to run

  To run the project just execute:

   ```sh
   npm run dev
   ```

  Theres other scripts which you can use to run the project (installation of docker + docker-compose required)

## Comments

    - Tried to create an event bus for different components to communicate between each other, need more implementation.

    - There are two proxy classes that will augment the feature in localStorage by: 

        1. Enabling to store objets (serializing and deserializing the strings)
        2. Adding new methods like addItem, removeItem so we can append or remove items like we do with arrays

    - The vendors folder contain third party libs that are referenced directly in the index.html. It should be replaced by cdn providers like jsdelivery when deployed in production