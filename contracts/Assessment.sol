## roshan khan 
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    string public pin;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event PinSet(string pin);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        pin = "5432"; // Default PIN is set to "5432"
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");

        balance += _amount;

        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");

        if (balance < _withdrawAmount) {
            revert InsufficientBalance(balance, _withdrawAmount);
        }

        balance -= _withdrawAmount;

        emit Withdraw(_withdrawAmount);
    }

    function setPin(string memory _newPin) public {
        require(msg.sender == owner, "You are not the owner of this account");

        pin = _newPin;

        emit PinSet(_newPin);
    }

    // Tax estimator function
    function estimateTax(uint256 income, uint256 deductions, uint256 taxCredits) public pure returns(uint256) {
        uint256 taxableIncome = income - deductions;
        uint256 tax = taxableIncome * 20 / 100; // Assuming a flat tax rate of 20%
        if (taxCredits > tax) {
            return 0; // No tax liability if tax credits exceed tax amount
        }
        return tax - taxCredits;
    }
}
