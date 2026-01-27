// ReputedMochi Contract Interface

export class ReputedMochiContract {
    constructor(client, contractAddress) {
        this.client = client;
        this.contractAddress = contractAddress;
    }

    // Write Methods
    async register_project(owner, name, category, description, website) {
        return await this.client.callContractMethod(
            this.contractAddress,
            'register_project',
            [owner, name, category, description, website]
        );
    }

    async deposit(user, amount) {
        return await this.client.callContractMethod(
            this.contractAddress,
            'deposit',
            [user, amount]
        );
    }

    async submit_review(reviewer, project_name, star_rating, review_text) {
        return await this.client.callContractMethod(
            this.contractAddress,
            'submit_review',
            [reviewer, project_name, star_rating, review_text]
        );
    }

    async vote_helpful(voter, review_id) {
        return await this.client.callContractMethod(
            this.contractAddress,
            'vote_helpful',
            [voter, review_id]
        );
    }

    async create_profile(address, username, bio, avatar_url, twitter, github, website) {
        return await this.client.callContractMethod(
            this.contractAddress,
            'create_profile',
            [address, username, bio, avatar_url, twitter, github, website]
        );
    }

    async update_profile(address, bio, avatar_url, twitter, github, website) {
        return await this.client.callContractMethod(
            this.contractAddress,
            'update_profile',
            [address, bio, avatar_url, twitter, github, website]
        );
    }

    // Read Methods
    async get_my_dashboard(user) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_my_dashboard',
            [user]
        );
    }

    async get_my_reviews(user) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_my_reviews',
            [user]
        );
    }

    async get_my_transactions(user, limit) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_my_transactions',
            [user, limit]
        );
    }

    async get_review(review_id) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_review',
            [review_id]
        );
    }

    async get_project(project_name) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_project',
            [project_name]
        );
    }

    async get_reviews(project_name, limit) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_reviews',
            [project_name, limit]
        );
    }

    async get_all_projects() {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_all_projects',
            []
        );
    }

    async get_stats() {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_stats',
            []
        );
    }

    async project_exists(project_name) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'project_exists',
            [project_name]
        );
    }

    async get_profile(address) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_profile',
            [address]
        );
    }

    async get_profile_by_username(username) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_profile_by_username',
            [username]
        );
    }

    async username_available(username) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'username_available',
            [username]
        );
    }

    async has_profile(address) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'has_profile',
            [address]
        );
    }
}
