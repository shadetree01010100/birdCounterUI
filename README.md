# nio UI Scaffold
The easiest way to create a nio-powered UI is to start with our [UI scaffold](https://github.com/niolabs/ui-scaffold). It gets you up and running in minutes.


## What’s in the box

- From niolabs
    - [niolabs ui-kit](https://uikit.niolabs.com/) for components and styles
    - [niolabs pubkeeper](https://niolabs.com/product/pubkeeper) for publishing and subscribing to topics

- Third party software (click to review each library's licensing)
    - [ReactJS](https://reactjs.org/) site scaffold
    - [react-router](https://reacttraining.com/react-router/) for navigation
    - [webpack 4](https://webpack.js.org/) module bundling and development webserver

If you’re at all familiar with React, this simple example covers most of what you need to know to get started.


## Hello world (what time is it?)

Follow these steps to create a simple UI that can publish to, subscribe to, and display the output of your nio services.

1. In your terminal, clone the UI scaffold, enter the directory, and install dependencies.
    ```
    git clone https://github.com/niolabs/ui-scaffold.git my-project
    cd my-project
    npm i -s
    ```

1. In the root of the project, rename `config.js.example` to `config.js`, and fill out the pubkeeper server details from your pubkeeper server instance (see *Configuring Your Pubkeeper Server* below)

1. Start the project.
    ```
    npm start
    ```

1. Visit the project at https://0.0.0.0:3000.
    - The development web server uses a self-signed certificate, and you may see a warning about the site being insecure. In your local development environment, it is safe to click "Advanced" > "proceed to site anyway."
