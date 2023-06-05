// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract AccountV1 {
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
