// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@semaphore-protocol/contracts/interfaces/IVerifier.sol";
import "@semaphore-protocol/contracts/base/SemaphoreCore.sol";
import "@semaphore-protocol/contracts/base/SemaphoreGroups.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ZKApplicationWallet is SemaphoreCore, SemaphoreGroups {
  
  //mapping(address=>uint256) zkWalletBalance;
  mapping(address=>uint256) applicationTokenBalance;
  mapping(address => bool) applications;
  mapping(address => address) applicationAcceptingTokenAddress;
  mapping(address => uint256) zkWalletTokenBalance;
  mapping(address=>mapping(uint256=>uint256)) applicationUserTokenBalance;

  event ApplicationAdded( address  indexed applicationAddress, address indexed _tokenContract ,  uint8 _treeDepth) ;
  
  
  function addApplication(address _tokenContractAddress , uint8 _treeDepth) public {
        require(!applications[msg.sender] ,"Application already join zkApplicationWallet");
        require(applicationAcceptingTokenAddress[msg.sender] == address(0), "Token Contract address already set" );
        applicationAcceptingTokenAddress[msg.sender] = _tokenContractAddress;
        applications[msg.sender] = true;

        uint256 applicationId = uint256(uint160(msg.sender));

        _createGroup(applicationId, _treeDepth, 0);

        emit ApplicationAdded(msg.sender , _tokenContractAddress, _treeDepth);
    }

    function depositeERC20(address _applicationAddress , uint256 _amount, uint256 nullifierHash) public {
      require(applications[_applicationAddress],"No application exist for which deposite is initiated.");
      require(applicationAcceptingTokenAddress[_applicationAddress] != address(0), "Token accepted by application not set." );
      IERC20 _tokenContract = IERC20(applicationAcceptingTokenAddress[_applicationAddress]);
      _tokenContract.transferFrom(msg.sender, address(this),_amount);

      


    }

  
    
}