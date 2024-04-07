// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract Seiyaj is ERC20, ERC20Capped {
    event WhitelistSet(address indexed user, uint256 amount);
    event Faucet(address indexed user, uint256 amount);
    // Admin address, used to add whitelist users
    address public admin;
    // Mapping of whitelisted addresses to their maximum allowed balance
    // We decease this amount when user faucet new tokens
    // We only need this mapping, instead of need a mapping for check whether user is whitelist, and other mapping to check how much token faucet
    mapping(address => uint256) public whitelist;

    constructor() ERC20("Seiyaj", "SEI") ERC20Capped(1000000000 ether) {
        // Total cap is 1 billion SEI
        // Admin will be the contract creator
        admin = msg.sender;
    }

    //******************** USER FUNCITON *********************/

    /**
     @notice User call faucet to mint allowed amount of token
     @param amount Amount of token to mint
     */
    function faucet(uint256 amount) external {
        require(whitelist[msg.sender] >= amount, "Exceed");
        whitelist[msg.sender] -= amount;
        _mint(msg.sender, amount);
        emit Faucet(msg.sender, amount);
    }

    /**
     @notice User call to send token to multiple recipient
     @param users Array of recipient address
     @param amounts Array of amount to send to each recipient
     @dev Notice the gas fee
     */
    function sendMultipleRecipient(
        address[] calldata users,
        uint256[] calldata amounts
    ) external {
        require(users.length == amounts.length, "Invalid length");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < users.length; i++) {
            totalAmount += amounts[i];
        }
        // We early revert here to save the gas fee
        require(totalAmount <= balanceOf(msg.sender), "Insufficient balance");

        for (uint256 i = 0; i < users.length; i++) {
            _transfer(msg.sender, users[i], amounts[i]);
        }
    }

    //******************** ADMIN FUNCITON *********************/
    /**
        @notice Set whitelist for the user with increased amount
        @param user Address of the user
        @param amount Increased amount
        @dev We increase the amount, instead of setting the amount, so that we can easily add more amount to the user.
        We combine this function with check on backend to prevent spam users
     */
    function setWhitelist(address user, uint256 amount) external onlyAdmin {
        whitelist[user] += amount;
        emit WhitelistSet(user, whitelist[user]);
    }

    /**
     @notice Admin transfer ownership
     @param newAdmin New admin address
     */
    function transferAdminOwnership(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    //******************** INTERNAL FUNCTION *********************/

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }

    //******************** MODIFIER *********************/

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin");
        _;
    }
}
