// 이것은 컨트랙트를 배포하기 위한 스크립트입니다. 이 스크립트를 수정하여
// 자신의 컨트랙트를 배포하거나 새로운 컨트랙트를 생성할 수 있습니다.

const path = require("path");

async function main() {
  // 이것은 단순한 편의 검증입니다.
  if (network.name === "hardhat") {
    console.warn(
      "Hardhat 네트워크에 컨트랙트를 배포하려고 합니다. 이 네트워크는" +
        "매번 자동으로 생성되고 소멸됩니다. Hardhat 옵션 '--network localhost'를 사용하세요."
    );
  }

  // ethers는 전역 범위에서 사용할 수 있습니다.
  const [deployer] = await ethers.getSigners();
  console.log(
    "다음 계정으로 컨트랙트를 배포합니다:",
    await deployer.getAddress()
  );

  console.log("계정 잔액:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  console.log("토큰 주소:", token.address);

  // 우리는 또한 컨트랙트의 아티팩트와 주소를 프론트엔드 디렉토리에 저장합니다.
  saveFrontendFiles(token);
}

function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
