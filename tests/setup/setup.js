import fs from 'fs';

const clearRecords = async () => {
    const { redflags } = await JSON.parse(fs.readFileSync('redflags__test.json'));

    redflags.splice(3, redflags.length);
    const obj = {};
    obj.redflags = redflags;
    fs.writeFileSync('redflags__test.json', JSON.stringify(obj, null, 2), (err) => {
        if (err) {
            return res.status(500).json({
                status: 500,
                error: 'there was an error while trying to save the redflag',
            });
        }
    });
    console.log(redflags);
}
 

export {
    clearRecords,
};