module.exports.processedMailFetchPipeline = (createdBy, daysAgo) => {
  return [
    { $match: { owner: createdBy } },
    {
      $facet: {
        total: [{ $count: "count" }],
        last7: [
          { $match: { processAt: { $gte: daysAgo(7) } } },
          { $count: "count" }                        
        ],
        last30: [
          { $match: { processAt: { $gte: daysAgo(30) } } },
          { $count: "count" }
        ],
        last90: [
          { $match: { processAt: { $gte: daysAgo(90) } } },
          { $count: "count" }
        ],
        tagInputStats: [
          { $unwind: "$matchedTagInput" },
          { $group: { _id: "$matchedTagInput", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        topPatterns: [
          { $unwind: "$matchDetails" },
          { $group: { _id: "$matchDetails.patternRaw", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]
      }
    }
  ];
}