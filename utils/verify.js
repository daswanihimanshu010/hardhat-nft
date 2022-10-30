const { run } = require("hardhat");
// ETHER SCAN VERIFY
async function verify(contractAddress, args) {
  // Now we will import run command to run any hardhat console tasks like verify
  console.log("Verifying, please wait...");

  // to get want commands that verify has to offer insdie verify task run yarn hardhat verify --help
  // that is why we are using verify:verify because there is one more task inside verify named "verify"

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!!");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };
