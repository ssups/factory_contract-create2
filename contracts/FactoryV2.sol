// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "hardhat/console.sol";

contract AccountV2 {
    address private _owner;

    constructor(address owner) {
        _owner = owner;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    function setOwner(address owner) external onlyOwner {
        _owner = owner;
    }

    function destroy(address payable recipient) external onlyOwner {
        selfdestruct(recipient);
    }

    receive() external payable {}
}

contract FactoryV2 {
    event Deploy(address addr, uint256 salt);

    function deploy(uint256 salt) external {
        AccountV2 accountC = new AccountV2{salt: bytes32(salt)}(msg.sender);
        // console.log("tx origin", tx.origin);
        // console.log("msg.sender", msg.sender);

        emit Deploy(address(accountC), salt);
    }

    function getAddress(
        address accountOwner,
        uint256 salt
    ) external view returns (address) {
        bytes memory bytecode = getBytecode(accountOwner);
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        // console.log("msg.sender", msg.sender);
        // console.log("address this", address(this));
        return address(uint160(uint(hash)));
    }

    function getBytecode(
        address accountOwner
    ) public pure returns (bytes memory) {
        bytes memory bytecode = type(AccountV2).creationCode;
        return abi.encodePacked(bytecode, abi.encode(accountOwner));
    }
}
