const codeExecutor = require("../utils/codeExecutor");

exports.runCode = async (code, language) => {

    const result = await codeExecutor.execute(code, language);

    return result;

};