// Constants
const fs = require('fs');
const BUCKETS = 997;
const NUM_PERSONS = 1000000;

// Data collections for name generation
const FIRST_NAMES_F = ["Adelina", "Adina", "Ana", "Andra", "Aurora", "Bianca",
    "Camelia", "Carina", "Crina", "Carmen", "Cristina", "Claudia", "Daria", "Diana",
    "Daniela", "Elena", "Eliza", "Ema", "Emilia", "Gabriela", "Georgiana", "Gina",
    "Ioana", "Iulia", "Izabela", "Iris", "Laura", "Lavinia", "Larisa", "Lidia",
    "Luiza", "Madalina", "Mara", "Maria", "Melania", "Mihaela", "Mirela", "Monica",
    "Mariana", "Marina", "Nadia", "Nicoleta", "Nina", "Oana", "Otilia", "Olivia",
    "Paula", "Raluca", "Ramona", "Rodica", "Roxana", "Ruxandra", "Sabina", "Silvia",
    "Stefania", "Teodora", "Valentina", "Violeta", "Tamara", "Zoe"];

const FIRST_NAMES_M = ["Adelin", "Anton", "Alexandru", "Andrei", "Bogdan", "Adrian",
    "Catalin", "Cristian", "Cosmin", "Costin", "Daniel", "Claudiu", "Daniel", "David",
    "Dragos", "Eduard", "Emilian", "Emanuel", "Florin", "Felix", "Gabriel", "George",
    "Iulian", "Ivan", "Laurentiu", "Liviu", "Lucian", "Madalin", "Marius", "Octavian",
    "Ovidiu", "Paul", "Pavel", "Raul", "Robert", "Dorin", "Sabin", "Sebastian",
    "Stefan", "Sorin", "Teodor", "Valentin", "Victor", "Vlad", "Cezar", "Doru",
    "Flaviu", "Eugen", "Grigore", "Horatiu", "Horia", "Iacob", "Iustin", "Leonard",
    "Marcel", "Nelu", "Rares", "Serban", "Sergiu", "Tudor"];

const LAST_NAMES = ["Abaza", "Adamescu", "Adoc", "Albu", "Baciu", "Badea", "Barbu",
    "Candea", "Caragiu", "Cernea", "Chitu", "Conea", "Danciu", "Deac", "Diaconu",
    "Doinas", "Enache", "Ene", "Erbiceanu", "Filimon", "Florea", "Frosin", "Fulga",
    "Ganea", "Georgescu", "Ghinea", "Goga", "Hasdeu", "Herlea", "Hoban", "Iacobescu",
    "Ionescu", "Irimia", "Josan", "Kiazim", "Lambru", "Lascu", "Lipa", "Lucan",
    "Lungu", "Lupu", "Manea", "Manolescu", "Marinescu", "Mugur", "Neagu", "Nechita",
    "Negrescu", "Nita", "Oancea", "Olaru", "Onciu", "Pascu", "Parvu", "Radulescu",
    "Nelu", "Rares", "Stan", "Tamas", "Tudoran"];

class HashTable {
    constructor(size = BUCKETS) {
        this.size = size;
        this.table = Array(size).fill().map(() => []);
    }

    hashFunction(cnp) {
        // Using BigInt pentru că CNP-urile sunt numere prea mari pentru Number
        return Number(BigInt(cnp) % BigInt(this.size));
    }

    insertItem(data) {
        const index = this.hashFunction(data.cnp);
        this.table[index].push(data);
    }

    search(data) {
        let iterations = 1;
        const index = this.hashFunction(data.cnp);

        for (const entry of this.table[index]) {
            if (entry.cnp === data.cnp) {
                return iterations;
            }
            iterations++;
        }
        return -1; // Not found
    }

    getLoadFactor() {
        const totalElements = this.table.reduce((sum, bucket) => sum + bucket.length, 0);
        return totalElements / this.size;
    }
}

function padNumber(num, size) {
    return num.toString().padStart(size, '0');
}

function generateCNP() {
    const s = Math.floor(Math.random() * 8) + 1;
    const aa = Math.floor(Math.random() * 100);
    const ll = Math.floor(Math.random() * 12) + 1;
    const zz = Math.floor(Math.random() * 31) + 1;
    const jj = Math.floor(Math.random() * 48) + 1;
    const nnn = Math.floor(Math.random() * 999) + 1;
    const c = Math.floor(Math.random() * 10);

    return `${s}${padNumber(aa, 2)}${padNumber(ll, 2)}${padNumber(zz, 2)}${padNumber(jj, 2)}${padNumber(nnn, 3)}${c}`;
}

function generateName(cnp) {
    const sex = parseInt(cnp[0]);
    const firstNamesList = sex % 2 === 1 ? FIRST_NAMES_M : FIRST_NAMES_F;

    const firstName1 = firstNamesList[Math.floor(Math.random() * firstNamesList.length)];
    const firstName2 = firstNamesList[Math.floor(Math.random() * firstNamesList.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    return `${firstName1} ${firstName2} ${lastName}`;
}

function createPerson() {
    const cnp = generateCNP();
    return {
        cnp,
        name: generateName(cnp)
    };
}

async function main() {
    console.log("Generating CNPs and names...");
    const persons = Array(NUM_PERSONS).fill().map(() => createPerson());

    console.log("Building hash table...");
    const htable = new HashTable();
    persons.forEach(person => htable.insertItem(person));

    console.log(`Load factor: ${htable.getLoadFactor().toFixed(2)}`);

    console.log("Selecting random persons for search...");
    const SEARCH_SIZE = 1000;
    const randomIndices = Array(SEARCH_SIZE).fill()
        .map(() => Math.floor(Math.random() * NUM_PERSONS));

    let originalIterations = randomIndices.reduce((sum, index) => sum + index, 0);

    console.log("Searching for persons...");
    let totalHashIterations = 0;
    let results = [];
    let statistics = [];

    for (let i = 0; i < SEARCH_SIZE; i++) {
        const index = randomIndices[i];
        const person = persons[index];
        const iterations = htable.search(person);
        totalHashIterations += iterations;

        results.push(`${person.cnp}, ${person.name}\t - original position: ${index} / hash table: ${iterations} iterations.`);
    }

    // Calculate statistics
    const avgHashIterations = totalHashIterations / SEARCH_SIZE;
    const avgOriginalIterations = originalIterations / SEARCH_SIZE;
    const improvement = 100 * (originalIterations - totalHashIterations) / originalIterations;

    statistics.push(`Search Statistics for ${SEARCH_SIZE} persons:`);
    statistics.push(`Total hash table iterations: ${totalHashIterations}`);
    statistics.push(`Total original structure iterations: ${originalIterations}`);
    statistics.push(`Average hash table iterations: ${avgHashIterations.toFixed(2)}`);
    statistics.push(`Average original structure iterations: ${avgOriginalIterations.toFixed(2)}`);
    statistics.push(`Improvement: ${improvement.toFixed(2)}% fewer iterations`);

    // Write results to files
    const resultText = results.join('\n');
    const statisticsText = statistics.join('\n');

    await fs.writeFile('result.txt', resultText, err => {
        if (err) {
            console.error(err);
        } else {
            console.log('results.txt was written succesfully');
        }
    });
    await fs.writeFile('statistics.txt', statisticsText, err => {
        if (err) {
            console.error(err);
        } else {
            console.log('statistics.txt was written succesfully');
        }
    });
    //console.log("Files have been written successfully");

}

// Run the program
main().catch(console.error);
