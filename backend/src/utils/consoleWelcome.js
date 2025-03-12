/**
 * Console Welcome text utility
 * Prints basic server information to the console on start
 */

//Print welcome text with basic information to the console
function printConosoleWelcome(config) {
  console.log(
    `  _        _           _ _       _                     \n` +
      ` | |      (_)         | (_)     | |                    \n` +
      ` | |_ _ __ _ _ __ ___ | |_ _ __ | | __  ___  _ __ __ _ \n` +
      " | __| '__| | '_ ` _ \\| | | '_ \\| |/ / / _ \\| '__/ _` |\n" +
      ` | |_| |  | | | | | | | | | | | |   < | (_) | | | (_| |\n` +
      `  \\__|_|  |_|_| |_| |_|_|_|_| |_|_|\\_(_)___/|_|  \\__, |\n` +
      `                                                  __/ |\n` +
      `                                                 |___/ \n`
  );
  console.log(`trimlink.org server ready for requests.`);
  console.log(`
PORT:\t${config.PORT}
ENV:\t${config.NODE_ENV}
URL:\t${config.BASE_URL}

    `);
}

module.exports = printConosoleWelcome;
