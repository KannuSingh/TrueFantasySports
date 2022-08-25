//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IScoreAndTeamVerifier.sol";

contract TrueFantasySports_V1 {
    
   
    struct Contest { 
        uint256 contestId;
        uint256 matchId;
        uint256 contestCompletionTime;
        uint teamSubmissionEndTime;
        uint256 entryFee;
        bool createdFlag;
    }

     // store mapping of contestId with contest structure
     IERC20 private tokenContract;
    mapping(uint256 => Contest) contests;
    mapping(uint256 => uint256) contestHighestScore;
    mapping(uint256 => uint256) contestWinningAmount;
    mapping(uint256 => bool) contestWinningAmountClaimed;
    mapping(uint256 => address) contestHighestScoreHolder;
    mapping(uint256 =>mapping(address => uint32)) usersContestTeamCounter;
    mapping(uint256 => mapping(address => uint256)) usersContestScore;
    mapping(uint256 =>mapping(address => bytes32) )contestMembersTeamHashes;
    //store mapping of matchId with List of ContestId
    mapping(uint256 => uint256[] ) matchContestList;
  
    /// @dev Emitted when a new member is added.
    /// @param contestId: Group id of the group.
    /// @param memberAddress: address of member.
    event MemberAdded(uint256 indexed contestId,uint256 indexed matchId, address indexed memberAddress);
    event ClaimedPrize(uint256 indexed contestId,address claimInitiator, address winnerAddress,uint256 amount);
    event TeamPosted(uint256 indexed contestId, address indexed memberAddress, bytes32 teamHash);
    event TeamUpdated(uint256 indexed contestId, address indexed memberAddress,  bytes32 teamHash);
    event TeamScore(uint256 indexed contestId, uint256 indexed teamHash, uint256 score);
    event ContestCreated(uint256 indexed contestId, bytes32 contestName,uint256 indexed matchId, uint256 entryFee, uint teamSubmissionEndTime ,uint256 contestCompletionTime);
    
    
    IScoreAndTeamVerifier public scoreAndTeamVerifier;
   
    mapping(uint256 => mapping(address => bool)) contestGroupMembers;
    
    constructor( IScoreAndTeamVerifier _scoreAndTeamVerifier , address _tokenContractAddress) {
        scoreAndTeamVerifier = _scoreAndTeamVerifier;
        tokenContract = IERC20(_tokenContractAddress);
    }
   
    function createContest(bytes32 _contestName, uint256 _matchId, uint _teamSubmissionEndTime, uint256 _contestCompletionTime, uint256 _entryFee  ) public {
        
        require(block.timestamp < _teamSubmissionEndTime,
            "Team Submission end time should be in the future");
       
        
        uint256 contestId = uint256(keccak256(abi.encodePacked(_contestName))) >> 8; 
        require(!contests[contestId].createdFlag, "Contest Name already exist, please create with new contest name" );

        tokenContract.transferFrom(msg.sender, address(this),_entryFee);
        contestWinningAmount[contestId] += _entryFee; 
        Contest storage contest = contests[contestId];
        contest.contestId = contestId;
        contest.matchId = _matchId;
        contest.teamSubmissionEndTime = _teamSubmissionEndTime;
        contest.contestCompletionTime = _contestCompletionTime;
        contest.entryFee = _entryFee;
        contest.createdFlag = true;
        
        // creating a mapping of matchId and list of Contests for that match
        matchContestList[_matchId].push(contestId);
       
        //Adding msg.sender to contest which got created.
        contestGroupMembers[contestId][msg.sender] = true;


        emit ContestCreated(contestId, _contestName,_matchId, _entryFee , _teamSubmissionEndTime,_contestCompletionTime);
        emit MemberAdded(contestId,_matchId,msg.sender);
    }

    // Adding participant to contest(group) will require to pay TFS token specified during Contest
    // creation
    // Steps involved:
    //1. Get Approval for Entry fee amount of TFS token for participant from participant TFS Token Account
    //2. Add/Transfer token to Contest Token account
    //3. Add participant to contest(group)
    function addMember(uint256 _contestId) public {
        //  tokenAddress.transferFrom(msg.sender, address(this), contestEntryFee[groupId]);
        require(block.timestamp < contests[_contestId].teamSubmissionEndTime , "Contest closed for new members, Team submission end time passed");
        require(!contestGroupMembers[_contestId][msg.sender],"User have already joined the contest.");
      
        tokenContract.transferFrom(msg.sender, address(this),contests[_contestId].entryFee);
        contestWinningAmount[_contestId] += contests[_contestId].entryFee; 
        contestGroupMembers[_contestId][msg.sender] = true;
        emit MemberAdded(_contestId,contests[_contestId].matchId,msg.sender);
    }

    function postTeam(
        bytes32 _teamHash,
        uint256 _contestId
    ) public {
        require(block.timestamp < contests[_contestId].teamSubmissionEndTime , "Contest closed for Team submisssion i.e end time passed");
        require(contestGroupMembers[_contestId][msg.sender],"Please join the contest first");
        require(usersContestTeamCounter[_contestId][msg.sender] == 0, "Already posted a team , try updating it.");
        
        saveTeamHash(_contestId,msg.sender,_teamHash);
        //incrementUpdateTeamCount
        usersContestTeamCounter[_contestId][msg.sender] +=1;
        emit TeamPosted(_contestId, msg.sender, _teamHash);
    }

    function updateTeam(
        bytes32 _teamHash,
        uint256 _contestId   
    ) public {
        require(contestGroupMembers[_contestId][msg.sender],"Please join the contest first");
        require(block.timestamp < contests[_contestId].teamSubmissionEndTime , "Contest closed for Team submisssion i.e end time passed");
        require(usersContestTeamCounter[_contestId][msg.sender]  != 0,"Team don't exist, Can't update team. Please first create team");
        
        saveTeamHash(_contestId,msg.sender,_teamHash);
       //incrementUpdateTeamCount
        usersContestTeamCounter[_contestId][msg.sender] +=1;
        emit TeamUpdated(_contestId,msg.sender,_teamHash);
    }


    
    function submitTeamScore( 
        uint256 _contestId, 
        uint256 _score,
        uint256 _teamHash,
        uint256[60] calldata _playersScorecard,
        uint256[8] calldata _teamAndScoreProof) public {
          //  require(block.timestamp > contests[_contestId].teamSubmissionEndTime , "Contest time not completed yet ");
          require(contestGroupMembers[_contestId][msg.sender],"Please join the contest first");
            require(usersContestTeamCounter[_contestId][msg.sender]  > 0,"No team submitted");

        bytes32 _hashTeamHash = hashTeamHash(_teamHash);
        require(contestMembersTeamHashes[_contestId][msg.sender] == _hashTeamHash,"Submit teamHash of your last saved team.");
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

        usersContestScore[_contestId][msg.sender] = _score;
        if(contestHighestScore[_contestId] < _score) {
          contestHighestScore[_contestId] = _score;
          contestHighestScoreHolder[_contestId] = msg.sender;
          }
        emit TeamScore(_contestId,_teamHash,_score);


    }

    function withdrawWinningAmount(uint256 _contestId) public{
                require(!contestWinningAmountClaimed[_contestId], "Already claimed the winning amount.");
                require(block.timestamp > contests[_contestId].contestCompletionTime , "Contest not yet completed  ");
                require(block.timestamp > contests[_contestId].teamSubmissionEndTime , "Contest not yet completed ");
                address winnerAddress =  contestHighestScoreHolder[_contestId] ;
                contestWinningAmountClaimed[_contestId] = true;
                tokenContract.transfer(winnerAddress,contestWinningAmount[_contestId]);
                emit ClaimedPrize(_contestId,msg.sender, winnerAddress,contestWinningAmount[_contestId]);
    }

    function getHighestScore(uint256 _contestId) public view returns (uint256) {
        return contestHighestScore[_contestId];
    }
    function getYourScore(uint256 _contestId) public view returns (uint256) {
        return usersContestScore[_contestId][msg.sender];
    }
    
    function getContest(uint256 contestId) view public returns(uint256 matchId, uint teamSubmissionEndTime,uint256 entryFee , uint256 contestCompletionTime )  {
            return (contests[contestId].matchId ,contests[contestId].teamSubmissionEndTime,contests[contestId].entryFee, contests[contestId].contestCompletionTime);
    }
    function hashTeamHash(uint256 _teamHash) private pure returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(_teamHash)));
    }
    
    function saveTeamHash(uint256 _contestId, address _memberAddress, bytes32 _teamHash) internal{
        contestMembersTeamHashes[_contestId][_memberAddress] = _teamHash;
    }

    
}
