//SPDX-License-Identifier: UNLICENSED

// Solidity 파일은 이 프라그마로 시작해야 합니다.
// 이는 솔리디티 컴파일러가 버전을 검증하는 데 사용됩니다.
pragma solidity ^0.8.9;

// 이 라이브러리를 가져와서 console.log를 사용할 수 있게 합니다.
import "hardhat/console.sol";

// 이것이 스마트 컨트랙트의 주요 구성 요소입니다.
contract Token {
    // 토큰을 식별하기 위한 문자열 타입 변수들입니다.
    string public name = "My Hardhat Token";
    string public symbol = "MHT";

    // 고정된 양의 토큰을 저장하는 부호 없는 정수형 변수입니다.
    uint256 public totalSupply = 1000000;

    // 주소 타입 변수는 이더리움 계정을 저장하는 데 사용됩니다.
    address public owner;

    // 매핑은 키/값 쌍을 저장하는 맵입니다. 여기서는 각 계정의 잔액을 저장합니다.
    mapping(address => uint256) balances;

    // Transfer 이벤트는 오프체인 애플리케이션이
    // 컨트랙트 내에서 무슨 일이 일어나는지 이해하는 데 도움을 줍니다.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /**
     * 계약 초기화.
     */
    constructor() {
        // totalSupply는 트랜잭션 발신자에게 할당되며,
        // 이는 컨트랙트를 배포하는 계정입니다.
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    /**
     * 토큰을 전송하는 함수.
     *
     * `external` 수정자는 함수가 *오직* 컨트랙트 외부에서 호출될 수 있도록 합니다.
     */
    function transfer(address to, uint256 amount) external {
        // 트랜잭션 발신자가 충분한 토큰을 가지고 있는지 확인합니다.
        // `require`의 첫 번째 인수가 `false`로 평가되면
        // 트랜잭션이 되돌려집니다.
        require(balances[msg.sender] >= amount, "Not enough tokens");

        // Hardhat Network의 기능인 console.log를 사용하여 메시지와 값을 출력할 수 있습니다:
        console.log(
            "Transferring from %s to %s %s tokens",
            msg.sender,
            to,
            amount
        );

        // 금액을 전송합니다.
        balances[msg.sender] -= amount;
        balances[to] += amount;

        // 오프체인 애플리케이션에 전송을 알립니다.
        emit Transfer(msg.sender, to, amount);
    }

    /**
     * 주어진 계정의 토큰 잔액을 조회하는 읽기 전용 함수.
     *
     * `view` 수정자는 상태를 변경하지 않음을 나타내며,
     * 이는 트랜잭션을 실행하지 않고도 호출할 수 있음을 의미합니다.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
