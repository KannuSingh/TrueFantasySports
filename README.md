<p align="center">    
    <h1 align="center">
        True Fantasy Sports
        </h1>
   </p>     
    <h4 align="center">Trustless and decentralized fantasy sports platform using zero-knowledge proofs</h4>
The repository is divided into three components: [web app] [relay] and [contracts].
The app is for playing fantasy sports. The project aims to create a trustless fantasy sports platform where users don't have to submit their fantasy team to win contests.

**Check out the POC and MVP** [here](https://www.truefantasysports.com)

## Fantasy Sports
Wikipedia
> A fantasy sport is a type of game where participants create virtual teams composed of proxies of real players of a professional sport. These teams compete based on the statistical performance of those players in actual games. This performance is converted into points compiled and totaled according to contest rules selected by each fantasy team's owner.

## Problem with existing web2 platforms
    * Users have to submit their team to the centralized platform to participate
    * Platform is centralized  and entirely controlled by the platform owners
    * Lack of transparency concerning how other users join the contests
    * End users must trust the platform to be fair and not cheat by creating the same team as theirs and putting it in the same contest.
    * Limited and fixed game plays/rules offered by the existing platform
    
## Solution
    * Create a Trustless and Decentralized fantasy sports platform using blockchain and a zero-knowledge proof system
    * Enabling complete transparency of the system using a public blockchain
    * Users don’t have to submit their team. The user keeps their team to themself so that no one can copy the user team and cheat.
    * Using the zkSnarks circuits platform proves the score gathered by the user’s team.
    * Let users pick from different game plays/rules to create contests. - NOT DONE
## Repository

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


