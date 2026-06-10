import readline from "readline";
import fs from "fs";   //This is necessary for importing and exporting to data.json

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


//This function is for displaying a question from readline and waiting until user enters.
function ask(q) {
    return new Promise(resolve => rl.question(q, resolve));
}


async function mainMenu() {
    while(true){
        const menu = await ask ("Enter Command: [RegisterHut, Book, List, Summary, Cancel, Exit]: ");
            if(menu === "RegisterHut"){
               await registerHut();
            } else if(menu === "Book"){
                await bookingHut();
            } else if(menu === "List"){
                await listBookings();
            } else if(menu === "Summary"){
                await summaryHut();
            } else if(menu === "Cancel"){
                await cancelHut();
            } else if(menu === "Exit"){
                await exitWork();
            } else {
                console.log("the command doesn’t exist");
            }
        }
}

mainMenu()


const loadData = () => {
    try {
        return JSON.parse(fs.readFileSync(`data.json`, `utf8`));
    } catch(err) {
        console.log("Data file not found or corrupt. Starting with empty data.");
        return { huts: [], bookings: [] }
    }
}
