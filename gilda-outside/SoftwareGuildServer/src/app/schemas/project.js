"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.projectSchema = new mongoose_1.Schema({
    project_id: Number,
    description: String,
    name: String,
    name_with_namespace: String,
    path: String,
    path_with_namespace: String,
    created_at: Date,
    default_branch: String,
    tag_list: [String],
    ssh_url_to_repo: String,
    http_url_to_repo: String,
    web_url: String,
    readme_url: String,
    avatar_url: String,
    star_count: Number,
    forks_count: Number,
    last_activity_at: Date,
    _links: {
        self: String,
        issues: String,
        merge_requests: String,
        repo_branches: String,
        labels: String,
        events: String,
        members: String
    },
    archived: Boolean,
    visibility: String,
    creator_id: Number,
    clones: [{
            count: Number,
            date: String
        }],
    statistics: {
        commit_count: Number,
    },
    files: [String],
    contributors: [Number],
    owners: [Number],
    languages: mongoose_1.Schema.Types.Mixed,
    community: [Number],
    potential_developers: [Number],
    heartbeat: Number
}, { minimize: false });
exports.projectSchema.pre("save", function (next) {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});
//# sourceMappingURL=project.js.map