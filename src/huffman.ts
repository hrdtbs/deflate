export function generateDeflateHuffmanTable(
    values: number[],
    maxLength: number = 15
): Map<number, { code: number; bitlen: number }> {
    const valuesCount: { [key: number]: number } = {}
    for (const value of values) {
        if (!valuesCount[value]) {
            valuesCount[value] = 1
        } else {
            valuesCount[value]++
        }
    }
    const valuesCountKeys = Object.keys(valuesCount)
    let tmpPackages: Array<{ count: number; simbles: number[] }> = []
    let tmpPackageIndex = 0
    let packages: Array<{ count: number; simbles: number[] }> = []
    if (valuesCountKeys.length === 1) {
        packages.push({
            count: valuesCount[0],
            simbles: [Number(valuesCountKeys[0])]
        })
    } else {
        for (let i = 0; i < maxLength; i++) {
            packages = []
            valuesCountKeys.forEach(value => {
                const pack = {
                    count: valuesCount[Number(value)],
                    simbles: [Number(value)]
                }
                packages.push(pack)
            })
            tmpPackageIndex = 0
            while (tmpPackageIndex + 2 <= tmpPackages.length) {
                const pack = {
                    count: tmpPackages[tmpPackageIndex].count + tmpPackages[tmpPackageIndex + 1].count,
                    simbles: tmpPackages[tmpPackageIndex].simbles.concat(tmpPackages[tmpPackageIndex + 1].simbles)
                }
                packages.push(pack)
                tmpPackageIndex += 2
            }
            packages = packages.sort((a: any, b: any) => {
                if (a.count < b.count) {
                    return -1
                }
                if (a.count > b.count) {
                    return 1
                }
                return 0
            })
            if (packages.length % 2 !== 0) {
                packages.pop()
            }
            tmpPackages = packages
        }
    }
    const valuesCodelen: { [key: number]: number } = {}
    packages.forEach(pack => {
        pack.simbles.forEach(symble => {
            if (!valuesCodelen[symble]) {
                valuesCodelen[symble] = 1
            } else {
                valuesCodelen[symble]++
            }
        })
    })

    let group: number[]
    const valuesCodelenKeys = Object.keys(valuesCodelen)
    const codelenGroup: { [key: number]: number[] } = {}
    let code = 0
    let codelen = 3
    let codelenValueMin = Number.MAX_SAFE_INTEGER
    let codelenValueMax = 0
    valuesCodelenKeys.forEach(valuesCodelenKey => {
        codelen = valuesCodelen[Number(valuesCodelenKey)]
        if (!codelenGroup[codelen]) {
            codelenGroup[codelen] = []
            if (codelenValueMin > codelen) {
                codelenValueMin = codelen
            }
            if (codelenValueMax < codelen) {
                codelenValueMax = codelen
            }
        }
        codelenGroup[codelen].push(Number(valuesCodelenKey))
    })

    code = 0
    const table = new Map<number, { code: number; bitlen: number }>()
    for (let i = codelenValueMin; i <= codelenValueMax; i++) {
        group = codelenGroup[i]
        if (group) {
            group = group.sort((a, b) => {
                if (a < b) {
                    return -1
                }
                if (a > b) {
                    return 1
                }
                return 0
            })
            group.forEach(value => {
                table.set(value, { code, bitlen: i })
                code++
            })
        }
        code <<= 1
    }
    return table
}
