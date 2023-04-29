const postNormalAd = require("../model/buySellPOstTable");
const utilityFunc = require("../../../utility/functions");
// const { default: axios } = require("axios");
// const ObjectId = require("objectid");

module.exports = {
    createBuyPostAd: async (req, res) => {
        try {
            data = req.decode;
            console.log("🚀 ~ file: PostAd.js:10 ~ createBuyPostAd: ~ data:", data)

            let validationData = await utilityFunc.validationData(req.body, [
                "postType",
                "asset",
                "withFiat",
                "yourPrice",
                "totalAmount",
                "availableBalance",
                "minOrderLimit",
                "maxOrderLimit",
                "paymentMethod",
                "paymentTimeLimit",
                "sellerUpiId",
                "orderStatus",
            ]);
            console.log("🚀 ~ file: PostAd.js:25 ~ createBuyPostAd: ~ validationData:", validationData)

            if (validationData && validationData.status) {
                console.log("🚀 ~ file: PostAd.js:28 ~ createBuyPostAd: ~ validationData && validationData.status:", validationData && validationData.status)
                return utilityFunc.sendErrorResponse(validationData.error, res);
            }

            const FundingAcountBalance = await utilityFunc.getBalance(
                req.decode.cryptoAddress
            );
            console.log("🚀 ~ file: PostAd.js:35 ~ createBuyPostAd: ~ FundingAcountBalance:", FundingAcountBalance)


            if (FundingAcountBalance < req.body.totalAmount) {
                console.log("🚀 ~ file: PostAd.js:44 ~ createBuyPostAd: ~ FundingAcountBalance < req.body.totalAmount:", FundingAcountBalance + " and " + req.body.totalAmount)
                return utilityFunc.sendErrorResponse(
                    { message: "Insufficient funds in wallet" },
                    res
                );
            }

            const p2pBuyOrder = await postNormalAd.create({
                userId: req.decode._id,
                postType: req.body.postType,
                asset: req.body.asset,
                withFiat: req.body.withFiat,
                yourPrice: req.body.yourPrice,
                highestOrderPrice: req.body.highestOrderPrice,
                lowestOrderPrice: req.body.lowestOrderPrice,
                priceType: req.body.priceType,
                totalAmount: req.body.totalAmount,
                availableBalance: req.body.availableBalance,
                minOrderLimit: req.body.minOrderLimit,
                maxOrderLimit: req.body.maxOrderLimit,
                paymentTimeLimit: req.body.paymentTimeLimit,
                terms: req.body.terms,
                autoReply: req.body.autoReply,
                counterPartyCondition: req.body.counterPartyCondition,
                orderStatus: req.body.orderStatus,
                sellerUpiId: req.body.sellerUpiId,
            });
            console.log("🚀 ~ file: PostAd.js:71 ~ createBuyPostAd: ~ p2pBuyOrder:", p2pBuyOrder)

            return utilityFunc.sendSuccessResponse(
                {
                    message: "Buy Post Ad created successfully",
                    data: p2pBuyOrder,
                },
                res
            );
        } catch (error) {
            console.log("🚀 ~ file: PostAd.js:81 ~ createBuyPostAd: ~ error:", error)
            return utilityFunc.sendErrorResponse(error, res);
        }
    },

    createSellPostAd: async (req, res) => {
        try {
            data = req.decode;
            console.log("🚀 ~ file: PostAd.js:89 ~ createSellPostAd: ~  data = req.decode;:", data = req.decode);

            let validationData = await utilityFunc.validationData(req.body, [
                "postType",
                "asset",
                "withFiat",
                "yourPrice",
                "totalAmount",
                "availableBalance",
                "minOrderLimit",
                "maxOrderLimit",
                "paymentMethod",
                "paymentTimeLimit",
                "buyerUpiId",
                "orderStatus",
            ]);
            console.log("🚀 ~ file: PostAd.js:104 ~ createSellPostAd: ~ validationData:", validationData)

            if (validationData && validationData.status) {
                return utilityFunc.sendErrorResponse(validationData.error, res);
            }

            const FundingAcountBalance = await utilityFunc.getBalance(
                req.decode.cryptoAddress
            );
            console.log("🚀 ~ file: PostAd.js:113 ~ createSellPostAd: ~ FundingAcountBalance:", FundingAcountBalance)

            //   const pricePerUsdt = await utilityFunc.getPrice(
            //     req.body.asset,
            //     req.body.withFiat
            //   );
            //

            if (FundingAcountBalance < req.body.totalAmount) {
                console.log("🚀 ~ file: PostAd.js:122 ~ createSellPostAd: ~ FundingAcountBalance < req.body.totalAmount:", FundingAcountBalance + " and " + req.body.totalAmount)
                return utilityFunc.sendErrorResponse(
                    { message: "Insufficient funds in wallet" },
                    res
                );
            }

            const p2pSellOrder = await postNormalAd.create({
                userId: req.decode._id,
                postType: req.body.postType,
                asset: req.body.asset,
                withFiat: req.body.withFiat,
                yourPrice: req.body.yourPrice,
                highestOrderPrice: req.body.highestOrderPrice,
                lowestOrderPrice: req.body.lowestOrderPrice,
                priceType: req.body.priceType,
                totalAmount: req.body.totalAmount,
                availableBalance: req.body.availableBalance,
                minOrderLimit: req.body.minOrderLimit,
                maxOrderLimit: req.body.maxOrderLimit,
                paymentTimeLimit: req.body.paymentTimeLimit,
                terms: req.body.terms,
                autoReply: req.body.autoReply,
                counterPartyCondition: req.body.counterPartyCondition,
                orderStatus: req.body.orderStatus,
                sellerUpiId: req.body.sellerUpiId,
            });
            console.log("🚀 ~ file: PostAd.js:149 ~ createSellPostAd: ~ p2pSellOrder:", p2pSellOrder)

            return utilityFunc.sendSuccessResponse(
                {
                    message: "sell Post Ad created successfully",
                    data: p2pSellOrder,
                },
                res
            );
        } catch (error) {
            console.log("🚀 ~ file: PostAd.js:159 ~ createSellPostAd: ~ error:", error)
            return utilityFunc.sendErrorResponse(error, res);
        }
    },
};
