const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 , plonk} = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        // we are passing the input signal a, b we would like to prove
        console.log('1x2 =',publicSignals[0]);


        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        // we use this to stimulate a verification call
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
        // the result is then pass in the verifyProof function in the contract to check that it is true
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Multiplier3");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const {proof, publicSignals} = await groth16.fullProve({"a":"2","b":"3","c":"1"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3/circuit_final.zkey")
        console.log('2x3x1 =', publicSignals[0])

        const editedPublicSignals = unstringifyBigInts(publicSignals)
        const editedProof = unstringifyBigInts(proof)
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals)
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a,b,c, Input)).to.be.true
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0,0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0];
        expect(await verifier.verifyProof(a,b,c,d)).to.be.false
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const {proof, publicSignals} = await plonk.fullProve({"a":"4","b":"3","c":"2"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/_plonkMultiplier3/circuit_final.zkey")
        console.log('4x3x2 =', publicSignals[0])

        const text = fs.readFileSync("contracts/circuits/_plonkMultiplier3/call.txt", "utf-8")
        const calldata = text.split(',')

        expect(await verifier.verifyProof(calldata[0], JSON.parse(calldata[1]))).to.be.true;
    });

    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        expect(await verifier.verifyProof(a,b)).to.be.false;
    });
});