  const {nftMethod} = require("./src/index");

  const postHandler = (request, response) => {
      let chunks = [];
      request.on("data", (chunk) => {
        chunks.push(chunk);
      });

      request.on("end", () => {
        const data = Buffer.concat(chunks);
        const querystring = data.toString();
        const parsedData = new URLSearchParams(querystring);
        const dataObj = {};
        for (var pair of parsedData.entries()) {
          dataObj[pair[0]] = pair[1];
        }
     const nftData ={
      name: "test",
      // symbol: "SYMBOL",
      // description: "Description",
      // sellerFeeBasisPoints: 0,
      imageFile: dataObj.imageFile,
    }
    console.log("request.data",request.data)
    nftMethod({name: dataObj.name, imageFile: dataObj.imageFile}, dataObj.method);
        console.log("dataObj: ", dataObj);
        response.writeHead(200, {
          "Content-Type": "application/json",
        });
        response.write(
          JSON.stringify({
            message: "Post Successfull",
          })
        );
        response.end();
      });
    };
    
    const getHandler = (request, response) => {
      const data = {
        name: "frontendguruji",
        category: "technology",
        website: "frontendguruji.com",
      };
      response.writeHead(200, {
        "Content-Type": "application/json",
      });
      response.write(
        JSON.stringify({
          message: "GET Successfull",
          data,
        })
      );
      response.end();
    };
    
    const defaultHandler = (request, response) => {
      response.writeHead(200, {
        "Content-Type": "application/json",
      });
      response.write(
        JSON.stringify({
          message: `API not found at ${request.url}`,
        })
      );
      response.end();
    };
    
    module.exports = {
      postHandler,
      getHandler,
      defaultHandler,
    };