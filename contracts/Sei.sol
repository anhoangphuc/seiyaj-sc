// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract Seiyaj is ERC20, ERC20Capped {
    event WhitelistSet(address indexed user, uint256 amount);
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

    /**
     @notice Admin transfer ownership
     @param newAdmin New admin address
     */
    function transferAdminOwnership(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }

    /**
        @notice Set whitelist for the user with increased amount
        @param user Address of the user
        @param amount Increased amount
        @dev We increase the amount, instead of setting the amount, so that we can easily add more amount to the user
     */
    function setWhitelist(address user, uint256 amount) external onlyAdmin {
        whitelist[user] += amount;
        emit WhitelistSet(user, whitelist[user]);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin");
        _;
    }
}
