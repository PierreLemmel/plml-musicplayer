export function resample(input: number[]|Float32Array, samples: number): number[] {
    const blockSize = input.length / samples;
    const result = new Array<number>(samples);

    let block=0, blockCount=0, blockSum=0;
    const addBlockToResult = () => {

        result[block++] = blockSum / blockCount;

        blockSum = 0;
        blockCount = 0;
    }

    for (let i = 0; i < input.length; i++){

        blockSum += Math.abs(input[i]);
        blockCount++;

        if (i >= (block + 1) * blockSize) {
            addBlockToResult();
        }
    }

    if (blockCount > 0) {
        addBlockToResult();
    }

    return result;
}