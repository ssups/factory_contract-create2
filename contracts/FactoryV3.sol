// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Create2.sol";

contract FactoryV3 {
    event Deploy(address addr);

    function deploy(
        bytes calldata bytecode,
        uint256 salt,
        uint256 amount
    ) external {
        address addr = Create2.deploy(amount, bytes32(salt), bytecode);
        emit Deploy(addr);
    }

    function getAddress(
        uint256 salt,
        bytes calldata bytecode
    ) external view returns (address addr) {
        bytes32 bytecodeHash = keccak256(bytecode);
        addr = Create2.computeAddress(bytes32(salt), bytecodeHash);
    }
}
