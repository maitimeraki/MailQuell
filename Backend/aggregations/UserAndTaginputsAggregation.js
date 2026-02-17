// Aggregate functions for fetch taginputs and user details

module.exports.UserAndTaginputsAggregation = async (emailAddress) => {
    return [
        {
            $match: { email: emailAddress.toLowerCase() }
        },
        {
            $lookup: {
                from: "taginputs",
                // Creates a variable 'wId' from user's workspaceId (to match with taginputs.createdBy)
                let: { wid: { $toString: "$workspaceId" } },
                pipeline: [
                    {
                        $match: {
                            // $expr allows comparing fields/variables
                            $expr: {
                                $eq: ["$createdBy", "$$wid"] // Compare taginputs.createdBy = users.workspaceId
                            }
                        }
                    }

                ],
                as: "rawTags"

            }
        },
        { $limit: 1 }

    ]
};