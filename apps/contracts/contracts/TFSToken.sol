// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TFSToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("True Fantasy Sports", "TFS") {
        _mint(msg.sender, initialSupply);
    }
}