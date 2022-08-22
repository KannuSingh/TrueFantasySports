//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@semaphore-protocol/contracts/interfaces/IVerifier.sol";
import "@semaphore-protocol/contracts/base/SemaphoreCore.sol";
import "@semaphore-protocol/contracts/base/SemaphoreGroups.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IScoreAndTeamVerifier.sol";

contract TrueFantasySports is SemaphoreCore, SemaphoreGroups {
    
   
    struct Contest { // Struct
        uint256 contestId;
        uint256 matchId;
        uint256 contestCompletionTime;
        uint teamSubmissionEndTime;
        uint256 entryfee;
    }

     // store mapping of contestId with contest structure
    mapping(uint256 => Contest) contests;
mapping(uint256 => uint256) contestHighestScore;
    mapping (uint256 => uint32) teamCounter;
    mapping (uint256 => mapping(uint256 => uint256)) userContestScore;
    mapping(uint256 => mapping(uint256 => bool)) contestIdentityCommitmentMapping;
    mapping(uint256 => bytes32) membersTeamHashes;
    //store mapping of matchId with List of ContestId
    mapping(uint256 => uint256[] ) matchContestList;
  

    event TeamPosted(uint256 indexed groupId, bytes32 signal);
    event TeamScore(uint256 indexed groupId, uint256 indexed teamHash, uint256 score);
    event ContestCreated(uint256 indexed contestGroupId, bytes32 contestName,uint256 indexed matchId, uint256 entryFee, uint teamSubmissionEndTime ,uint256 contestCompletionTime);

    uint8 public treeDepth;
    IVerifier public semaphoreMembershipVerifier;
    IScoreAndTeamVerifier public scoreAndTeamVerifier;
   // mapping(uint256 => uint256) internal contestEntryFee;
   // IERC20 public tokenAddress;

    constructor(uint8 _treeDepth, IVerifier _semaphoreMembershipVerifier, IScoreAndTeamVerifier _scoreAndTeamVerifier) {
        treeDepth = _treeDepth;
        semaphoreMembershipVerifier = _semaphoreMembershipVerifier;
        scoreAndTeamVerifier = _scoreAndTeamVerifier;
    }
    //1.getContest(contestId)
    //2. getUserNullifierCount(nullifierHash)
    function getUserNullifierCount(uint256 nullifierHash) view public returns(uint256 count)  {
            return teamCounter[nullifierHash];
    }
    function getContest(uint256 contestId) view public returns(uint256 matchId, uint teamSubmissionEndTime,uint256 entryfee , uint256 contestCompletionTime )  {
            return (contests[contestId].matchId ,contests[contestId].teamSubmissionEndTime,contests[contestId].entryfee, contests[contestId].contestCompletionTime);
    }
    function createContest(bytes32 _contestName, uint256 _matchId, uint _teamSubmissionEndTime, uint256 _contestCompletionTime, uint256 _entryFee ,uint256 _identityCommitment ) public {
        
        require(block.timestamp < _teamSubmissionEndTime,
            "Team Submission end time should be in the future");
        uint256 contestId = hasContestName(_contestName);
       
        _createGroup(contestId, treeDepth, 0);

        Contest storage contest = contests[contestId];
        contest.contestId = contestId;
        contest.matchId = _matchId;
        contest.teamSubmissionEndTime = _teamSubmissionEndTime;
        contest.contestCompletionTime = _contestCompletionTime;
        contest.entryfee = _entryFee;
        

        matchContestList[_matchId].push(contestId);
        _addMember( contestId,  _identityCommitment);
        contestIdentityCommitmentMapping[contestId][_identityCommitment] = true;
        //contestEntryFee[contestGroupId] = entryFee;

        emit ContestCreated(contestId, _contestName,_matchId, _entryFee , _teamSubmissionEndTime,_contestCompletionTime);
    }

    // Adding participant to contest(group) will require to pay TFS token specified during Contest
    // creation
    // Steps involved:
    //1. Get Approval for Entry fee amount of TFS token for participant from participant TFS Token Account
    //2. Add/Transfer token to Contest Token account
    //3. Add participant to contest(group)
    function addMember(uint256 _contestId, uint256 _identityCommitment) public {
      //  tokenAddress.transferFrom(msg.sender, address(this), contestEntryFee[groupId]);
      require(block.timestamp < contests[_contestId].teamSubmissionEndTime , "Contest closed for new members, Team submission end time passed");
        require(!contestIdentityCommitmentMapping[_contestId][_identityCommitment],"User have already joined the contest.");
        _addMember(_contestId, _identityCommitment);
        contestIdentityCommitmentMapping[_contestId][_identityCommitment] = true;
    }

    function postTeam(
        bytes32 _teamIdentifier,
        bytes32 _teamHash,
        uint256 _nullifierHash,
        uint256 _contestId,
        uint256[8] calldata _proof
    ) public {
        require(block.timestamp < contests[_contestId].teamSubmissionEndTime , "Contest closed for Team submisssion i.e end time passed");
        require(teamCounter[_nullifierHash] == 0, "Already posted a team , try updating it.");
        uint256 root = groups[_contestId].root;

        _verifyProof(_teamIdentifier, root, _nullifierHash, _contestId, _proof, semaphoreMembershipVerifier);

        saveTeamHash(_nullifierHash,_teamHash);
        //In our usecase user can submit _teamHash multiple time untill teamSubmissionEndTime is reached.
        _saveNullifierHash(_nullifierHash);
        //incrementUpdateTeamCount
        teamCounter[_nullifierHash] +=1;
        emit TeamPosted(_contestId, _teamIdentifier);
    }

    function updateTeam(
        bytes32 _teamIdentifier,
        bytes32 _teamHash,
        uint256 _initialNullifierHash,
        uint256 _newNullifierHash,
       
        uint256 _contestId,
        uint256[8] calldata _proof
    ) public {
      //  require(block.timestamp < contests[_contestId].teamSubmissionEndTime , "Contest closed for Team submisssion i.e end time passed");
        require(teamCounter[_initialNullifierHash] != 0,"Team don't exist, Can't update team. Please first create team");
        
        uint256 root = groups[_contestId].root;
        uint32 _updateTeamCount = teamCounter[_initialNullifierHash];
        uint256 _externalNullifier = calculateExternalNullifier(_contestId,_updateTeamCount,_initialNullifierHash);
    
        _verifyProof(_teamIdentifier, root, _newNullifierHash, _externalNullifier, _proof, semaphoreMembershipVerifier);

        saveTeamHash(_initialNullifierHash,_teamHash);
        //In our usecase user can submit _teamHash multiple time untill teamSubmissionEndTime is reached.
        _saveNullifierHash(_newNullifierHash);
        //incrementUpdateTeamCount
        teamCounter[_initialNullifierHash] +=1;
        emit TeamPosted(_contestId, _teamIdentifier);
    }

    function saveTeamHash(uint256 _nullifierHash, bytes32 _teamHash) internal{
        membersTeamHashes[_nullifierHash] = _teamHash;
    }
    
    function submitTeamScore( 
        bytes32 _teamIdentifier,
        uint256 _initialNullifierHash ,
        uint256 _newNullifierHash,
        uint256 _contestId, 
        uint256[8] calldata _semaphoreProof, 
        uint256 _score,
        uint256 _teamHash,
        uint256[60] calldata _playersScorecard,
        uint256[8] calldata _teamAndScoreProof) public {
          //  require(block.timestamp > contests[_contestId].teamSubmissionEndTime , "Contest time not completed yet ");
            require(teamCounter[_initialNullifierHash] > 0,"No team submitted");
           // require(membersTeamHashes[_initialNullifierHash] > 0,"No team submitted");

        uint256 root = groups[_contestId].root;
        uint32 _teamCounter = teamCounter[_initialNullifierHash];
        uint256 _externalNullifier = calculateExternalNullifier(_contestId,_teamCounter,_initialNullifierHash);

         _verifyProof(_teamIdentifier, root, _newNullifierHash, _externalNullifier, _semaphoreProof, semaphoreMembershipVerifier);

        bytes32 _hashTeamHash = hashTeamHash(_teamHash);
        require(membersTeamHashes[_initialNullifierHash] == _hashTeamHash,"Submit teamHash of your last saved team.");
        uint256[62] memory _input;
        _input[0] = _score;
        _input[1] = _teamHash;
        for(uint256 i= 0 ; i<60 ;i++){
            _input[i+2] = _playersScorecard[i];
        }

        scoreAndTeamVerifier.verifyProof(
            [_teamAndScoreProof[0], _teamAndScoreProof[1]],
            [[_teamAndScoreProof[2], _teamAndScoreProof[3]], [_teamAndScoreProof[4], _teamAndScoreProof[5]]],
            [_teamAndScoreProof[6], _teamAndScoreProof[7]],
            _input
        );

        userContestScore[_contestId][_initialNullifierHash] = _score;
        teamCounter[_initialNullifierHash] +=1;
        if(contestHighestScore[_contestId] < _score) {contestHighestScore[_contestId] = _score;}
        emit TeamScore(_contestId,_teamHash,_score);


    }

function getHighestScore(uint256 _contestId) public view returns (uint256) {
    return contestHighestScore[_contestId];
}
function getYourScore(uint256 _contestId,uint256 _nullifierHash) public view returns (uint256) {
    return userContestScore[_contestId][_nullifierHash];
}
    function hasContestName(bytes32 contestId) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(contestId))) >> 8;
    }

    function hashTeamHash(uint256 _teamHash) private pure returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(_teamHash)));
    }

    function calculateExternalNullifier(uint256 contestId, uint32 _updateTeamCount,uint256 _initialNullifierHash) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(contestId,_updateTeamCount,_initialNullifierHash))) >> 8;
    }
}
