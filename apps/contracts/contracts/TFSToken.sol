// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TFSToken is ERC20 {
    mapping(address => uint256) lastMintTime;

    constructor(uint256 initialSupply) ERC20("True Fantasy Sports", "TFS") {
        _mint(msg.sender, initialSupply);
    }

    function mint10Token() public {
         require(block.timestamp - lastMintTime[msg.sender] > 24*60*60,"Can not mint more token withing 24 Hr");
        lastMintTime[msg.sender] = block.timestamp;
        _mint(msg.sender, 10 * 10**18);
    }
}