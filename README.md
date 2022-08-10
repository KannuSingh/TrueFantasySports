<p align="center">
    <h1 align="center">
        
        True Fantasy Sport
    </h1>
</p>

| The repository is divided into three components: [web app] [relay] and [contracts]. The app for playing fantasy sports anonymously without revealing their original identity using zero knowledge and semaphore Identity. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

Clone your repository:

```bash
git clone https://github.com/<your-username>/<your-repo>.git
```

and install the dependencies:

```bash
cd <your-repo> && yarn
```

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

and add your environment variables.

ℹ️ You can use the default ones to start the app in a local network.

### Start the app

Run the following commands sequentially in three separate tabs of the terminal:

```bash
yarn start:contracts
```

```bash
yarn start:web-app
```

```bash
yarn start:relay
```

### Code quality and formatting

Run [ESLint](https://eslint.org/) to analyze the code and catch bugs:

```bash
yarn lint
```

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

or to automatically format the code:

```bash
yarn prettier:write
```
