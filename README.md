<p align="center">    
    <h1 align="center">
        True Fantasy Sports
        </h1>
   </p>     
    <h4 align="center">Trustless and decentralized fantasy sports platform using zero knowledge proofs</h4>
The repository is divided into three components: [web app] [relay] and [contracts].
The app is for playing fantasy sports. The project aims to create trustless fantasy sports platform where user don't have to submit their fantasy team inorder to win contest.

**Check out the POC and MVP** [here](https://www.truefantasysports.com)

## Fantasy Sports
Wikipidea
> A fantasy sport is a type of game, where participants create virtual teams composed of proxies of real players of a professional sport. These teams compete based on the statistical performance of those players in actual games. This performance is converted into points that are compiled and totaled according to a contest rules selected by each fantasy team's owner.

## Problem with existing web2 platforms
    * User have to submit theirs team to centralized platform in order to participate
    * Platform is centralized  and completely controlled by the platform owners
    * Lack of transparency with respect to how other users joins the contests
    * End user have to trust platform to be fair and not cheat by creating the same team as theirs and putting it on same contest.
    * Limited and fixed game plays/rules offered by exisiting platform
    
## Solution
    * Create Trustless and Decentalized fanstasy sports platform using blockchain and zero knowledge proof system
    * Enabling complete transparency of the system using public blockchain
    * User don’t have to submit their team. User keeps its team to themself so that no one can copy the user team and cheat.
    * Using zkSnarks circuits platform proves the score gather by user’s team.
    * Provide users to pick from different game plays/rule to create contests. 

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


