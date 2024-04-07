// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract Seiyaj is ERC20, ERC20Capped {
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
    function transferAdminOwnership(address newAdmin) external {
        require(msg.sender == admin, "Only admin can transfer ownership");
        admin = newAdmin;
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
