/**
 *Submitted for verification at Etherscan.io on 2021-05-31
*/

pragma solidity >=0.5.0;


interface IERC20 {
   
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferWithoutDeflationary(address recipient, uint256 amount) external returns (bool) ;
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool); 
    
    event Transfer(address indexed from, address indexed to, uint256 value); 
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

library SafeMath {
   
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

   
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

   
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
        // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
        // for accounts without code, i.e. `keccak256('')`
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        // solhint-disable-next-line no-inline-assembly
        assembly { codehash := extcodehash(account) }
        return (codehash != accountHash && codehash != 0x0);
    }

    /**
     * @dev Converts an `address` into `address payable`. Note that this is
     * simply a type cast: the actual underlying value is not changed.
     *
     * _Available since v2.4.0._
     */
    function toPayable(address account) internal pure returns (address payable) {
        return address(uint160(account));
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     *
     * _Available since v2.4.0._
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call.value(amount)("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }
}

/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for ERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using SafeMath for uint256;
    using Address for address;

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        // solhint-disable-next-line max-line-length
        require((value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).add(value);
        callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
        callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves.

        // A Solidity high level call has three parts:
        //  1. The target address is checked to verify it contains contract code
        //  2. The call itself is made, and success asserted
        //  3. The return value is decoded, which in turn checks the size of the returned data.
        // solhint-disable-next-line max-line-length
        require(address(token).isContract(), "SafeERC20: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "SafeERC20: low-level call failed");

        if (returndata.length > 0) { // Return data is optional
            // solhint-disable-next-line max-line-length
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

contract Context {
  
    constructor () internal { }

    function _msgSender() internal view returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Returns true if the caller is the current owner.
     */
    function isOwner() public view returns (bool) {
        return _msgSender() == _owner;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

contract ShoeFyStaking is Ownable {

    string public name = "ShoeFy: Staking";
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    //staking steps
    uint256[] private times;
    uint256[] private rates;
    
    IERC20 public shoeFy;

    uint256 initialAPR = 20000;
    
    enum Functions { WITHDRAW, FEE }
    uint256 private constant _TIMELOCK = 1 days;
    mapping(uint  => uint256) public timelock;
    
    uint256 apr;
    uint256 stakeDelay;
	uint256 stakingRewards;
	address[] stakingUsers; 
    mapping(address => bool) private _hasStaked;
	mapping(address => uint256) private lastClaim;
	mapping(address => uint256) private userApr;
    mapping(address => uint256) private lockedtime;
    
    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;
    mapping(address => uint256) private currentReward;
    mapping(address => uint256) private lastPendingReward;
    
    address private liquidityLocker = 0x000000000000000000000000000000000000dEaD;
    address private daoTreasury = 0x000000000000000000000000000000000000dEaD;
    address public burnAddress = 0x000000000000000000000000000000000000dEaD;
    
    uint256 public burnFee = 1;
    uint256 public rewardFee = 1;
    uint256 public liquidityFee = 1;
    uint256 public daoFee = 1;


    uint256 totalStakedAmount;
    uint256 public totalUsers;


    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 amount
    );

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

    constructor() public {
        shoeFy = IERC20 (0xfBA067325d5F679D89f2933f4eA4c0158389455a);
        apr = initialAPR;
        totalUsers = 0;
    }
    
    modifier notLocked(uint _fn) {
        require(
          timelock[_fn] != 0 && timelock[_fn] <= block.timestamp,
          "Function is timelocked"
        );
        _;
    }
    
    //unlock timelock
    function unlockFunction(uint _fn) public onlyOwner {
        timelock[_fn] = block.timestamp + _TIMELOCK;
    }
    
    //lock timelock
    function lockFunction(uint _fn) public onlyOwner {
        timelock[_fn] = 0;
    }

    function stakedBalanceOf(address _guy) public view returns (uint256) {
		return allowed[address(this)][_guy];
	}

	function changeAPR(uint256 _apr) public onlyOwner {
		require(_apr>=0);
		apr = _apr;
	}
    
    function stakeIn(uint256 _amount) public {
		if(_hasStaked[msg.sender]) {
		//	_claimEarnings(msg.sender);
		}
		else {
			lastClaim[msg.sender] = block.timestamp;
			stakingUsers.push(msg.sender);
			_hasStaked[msg.sender] = true;
		}
		
		if(allowed[address(this)][msg.sender] == 0){
		    totalUsers = totalUsers + 1;
		}

		require(_amount > 0, "Amount shall be positive... who wants negative interests ?");
		userApr[msg.sender] = apr;
        shoeFy.transferFrom(msg.sender, address(this), _amount);
		allowed[address(this)][msg.sender] += _amount.mul(100 - burnFee - daoFee - liquidityFee - rewardFee).div(100);
		// transfer fee 
		shoeFy.transfer( burnAddress, _amount.mul(burnFee).div(100));
		shoeFy.transfer( daoTreasury, _amount.mul(daoFee).div(100));
		shoeFy.transfer( liquidityLocker, _amount.mul(liquidityFee).div(100));
		totalStakedAmount += _amount.mul(100 - burnFee - daoFee - liquidityFee).div(100);
		updateAPR();
		emit Transfer(msg.sender,address(this), _amount);
        emit Deposit(msg.sender, _amount);
        
	}
	
	function updateAPR() internal {
	    uint256 length = stakingUsers.length;
	    uint256 currentAPR = calculateAPR();
	    for(uint256 index = 0; index < length; ++index) {
	        lastPendingReward[stakingUsers[index]] = pendingRewards(stakingUsers[index]);
	        lastClaim[stakingUsers[index]] = block.timestamp;
	        userApr[stakingUsers[index]] = currentAPR;
	    }
	    apr = currentAPR;
	}
	
	function calculateAPR() public view returns (uint256)  {
	    if (totalUsers == 0){
	        return initialAPR;
	    }else{
	        return (initialAPR - totalStakedAmount.mul(10000).div(shoeFy.totalSupply())).div(sqrt(totalUsers));    
	    }
	}
	
	function sqrt(uint x) public view returns (uint) {
        uint z = (x + 1) / 2;
        uint y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

	function withdrawStake(uint256 amount) public {
		require(_hasStaked[msg.sender]);
		require(allowed[address(this)][msg.sender] >= amount, "You do not have enought... try a lower amount !");
		require(amount > 0, "Hmmm, stop thinking negative... and USE A POSITIVE AMOUNT");
		_claimEarnings(msg.sender);
		allowed[address(this)][msg.sender] -= amount;
		if(allowed[address(this)][msg.sender] == 0){
		    totalUsers = totalUsers - 1;
		    removeStakingUser(msg.sender);
		    _hasStaked[msg.sender] = false;
		}
		userApr[msg.sender] = apr;
        shoeFy.transfer(msg.sender, amount);
		totalStakedAmount -= amount;
		updateAPR();
        emit Transfer(address(this), msg.sender, amount);
        emit Withdraw(msg.sender, amount);
	}
	
	
	function removeStakingUser(address _guy) internal {
	    uint256 length = stakingUsers.length;
	    bool isUser = false;
	    uint arrIndex = 0;
	    for(uint256 index = 0; index < length; ++index) {
	        if(stakingUsers[index] == _guy){
	            isUser = true;
	            arrIndex = index;
	            break;
	        }
	    }
	    
	    stakingUsers[arrIndex] = stakingUsers[stakingUsers.length-1];
	    delete stakingUsers[stakingUsers.length-1]; // Implicitly recovers gas from last element storage
        stakingUsers.length--;
	}
	
	function getStakedUsers() public view returns(uint256){
	    return stakingUsers.length;
	}

    //for Owner
    function withdrawOwner(uint256 amount) external onlyOwner notLocked(uint(Functions.WITHDRAW)){
        require(amount<shoeFy.balanceOf(address(this)));
        shoeFy.transfer(msg.sender,amount);
        totalStakedAmount -= amount;
        timelock[uint(Functions.WITHDRAW)] = 0;
        emit Transfer(address(this), msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

	function _claimEarnings(address _guy) internal {
		require(_hasStaked[_guy], "Hmm... empty. Normal, you shall stake-in first !");
        // shoeFy.safeApprove(_guy, pendingRewards(_guy));
		shoeFy.safeTransfer(_guy, pendingRewards(_guy));
		emit Transfer(address(this), _guy, pendingRewards(_guy));
		lastClaim[_guy] = block.timestamp;
		lastPendingReward[_guy] = 0;
	}

	function pendingRewards(address _guy) public view returns (uint256) {
		return lastPendingReward[_guy] + (allowed[address(this)][_guy]*userApr[_guy]*(block.timestamp - lastClaim[_guy]))/315360000000;
	}

    function getTotoalAmount() external view returns(uint256){
       return shoeFy.balanceOf(address(this));
    }

	function claimStakingRewards() public {
		_claimEarnings(msg.sender);
	}

	function getCurrentAPR() public view returns (uint256) {
		return apr;
	}

	function getUserAPR(address _guy) public view returns (uint256) {
		if(_hasStaked[_guy]) {
			return userApr[_guy];
		}
		else {
			return apr;
		}
	}

    function totalStaked() public view returns (uint256) {
		return totalStakedAmount;
	}
	
	// Get and Set the Fee addresses
	function getLiquidityLokerAddress() public view returns (address) {
	    return liquidityLocker;
	}
	
	function setLiquidityLockerAddress(address _address) external onlyOwner {
	    liquidityLocker = _address;
	}
	
	function getDAOTreasury() public view returns (address) {
	    return daoTreasury;
	}
	
	function setDAOTreasury(address _address) external onlyOwner {
	    daoTreasury = _address;
	}
	
	
	// Set Fee options
	function setBurnFee(uint256 _burnFee) external onlyOwner notLocked(uint(Functions.FEE)){
	    burnFee = _burnFee;
	    timelock[uint(Functions.FEE)] = 0;
	}
	
	function setRewardFee(uint256 _rewardFee) external onlyOwner notLocked(uint(Functions.FEE)){
	    rewardFee = _rewardFee;
	    timelock[uint(Functions.FEE)] = 0;
	}
	
	function setLiquidityFee(uint256 _liquidityFee) external onlyOwner notLocked(uint(Functions.FEE)){
	    liquidityFee = _liquidityFee;
	    timelock[uint(Functions.FEE)] = 0;
	}
	
	function setDaoFee(uint256 _daoFee) external onlyOwner notLocked(uint(Functions.FEE)){
	    daoFee = _daoFee;
	    timelock[uint(Functions.FEE)] = 0;
	}
}
