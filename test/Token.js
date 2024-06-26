// 이것은 예제 테스트 파일입니다. Hardhat은 `test/` 디렉토리의 모든 *.js 파일을 실행하므로,
// 자유롭게 새로운 파일을 추가할 수 있습니다.

// Hardhat 테스트는 보통 Mocha와 Chai로 작성됩니다.

// 여기서 Chai를 가져와서 assert 함수들을 사용합니다.
const { expect } = require("chai");

// `loadFixture`를 사용하여 테스트 간에 공통 설정(또는 고정물)을 공유합니다.
// 이를 사용하면 테스트를 단순화하고 Hardhat Network의 스냅샷 기능을 활용하여
// 테스트를 더 빠르게 실행할 수 있습니다.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe`는 Mocha 함수로 테스트를 조직화할 수 있게 해줍니다.
// 테스트를 조직화하면 디버깅이 더 쉬워집니다. 모든 Mocha 함수는 전역 범위에서 사용할 수 있습니다.
//
// `describe`는 테스트 스위트의 섹션 이름과 콜백을 받습니다. 콜백은 해당 섹션의 테스트를 정의해야 합니다.
// 이 콜백은 비동기 함수일 수 없습니다.
describe("Token contract", function () {
  // 모든 테스트에서 동일한 설정을 재사용하기 위해 고정물을 정의합니다.
  // loadFixture를 사용하여 이 설정을 한 번 실행하고 그 상태를 스냅샷한 다음,
  // 각 테스트에서 Hardhat Network를 해당 스냅샷으로 재설정합니다.
  async function deployTokenFixture() {
    // 여기서 ContractFactory와 Signers를 가져옵니다.
    const Token = await ethers.getContractFactory("Token");
    const [owner, addr1, addr2] = await ethers.getSigners();

    // 컨트랙트를 배포하려면 Token.deploy()를 호출하고
    // 배포될 때까지 기다리면 됩니다. 이는 트랜잭션이
    // 채굴될 때 발생합니다.
    const hardhatToken = await Token.deploy();

    await hardhatToken.deployed();

    // 고정물은 테스트에 유용하다고 생각되는 모든 것을 반환할 수 있습니다.
    return { Token, hardhatToken, owner, addr1, addr2 };
  }

  // describe 호출을 중첩하여 하위 섹션을 만들 수 있습니다.
  describe("Deployment", function () {
    // `it`은 또 다른 Mocha 함수입니다. 이는 테스트를 정의하는 데 사용됩니다.
    // 테스트 이름과 콜백 함수를 받습니다.
    //
    // 콜백 함수가 비동기 함수인 경우, Mocha는 이를 `await`합니다.
    it("Should set the right owner", async function () {
      // loadFixture를 사용하여 환경을 설정한 다음, 모든 것이 잘 되었는지 확인합니다.
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

      // Expect는 값을 받아 assert 객체로 감쌉니다. 이 객체에는 값을 assert하는 많은 유틸리티 메서드가 있습니다.

      // 이 테스트는 컨트랙트에 저장된 owner 변수가 우리의 Signer의 owner와
      // 같을 것으로 기대합니다.
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // 50 토큰을 owner에서 addr1으로 전송합니다.
      await expect(
        hardhatToken.transfer(addr1.address, 50)
      ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

      // 50 토큰을 addr1에서 addr2로 전송합니다.
      // .connect(signer)를 사용하여 다른 계정에서 트랜잭션을 보냅니다.
      await expect(
        hardhatToken.connect(addr1).transfer(addr2.address, 50)
      ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
    });

    it("should emit Transfer events", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // 50 토큰을 owner에서 addr1으로 전송합니다.
      await expect(hardhatToken.transfer(addr1.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, addr1.address, 50);

      // 50 토큰을 addr1에서 addr2로 전송합니다.
      // .connect(signer)를 사용하여 다른 계정에서 트랜잭션을 보냅니다.
      await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(addr1.address, addr2.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // addr1 (0 토큰)에서 owner (1000 토큰)로 1 토큰을 보내려고 시도합니다.
      // `require`가 false로 평가되어 트랜잭션이 되돌려질 것입니다.
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      // owner 잔액은 변경되지 않아야 합니다.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});
