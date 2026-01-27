# ReputedMochi Clear - Reputation System with Clear UX
# { "Depends": "py-genlayer:latest" }
# Version: Clear UX - Better visibility and feedback

from genlayer import *

class ReputedMochi(gl.Contract):
    """
    ReputedMochi - Decentralized reputation system for Web3 projects
    CLEAR VERSION: Better UX with visible balances, review status, and transaction history
    """
    
    # Project Management
    project_owners: TreeMap[str, str]
    project_categories: TreeMap[str, str]
    project_descriptions: TreeMap[str, str]
    project_websites: TreeMap[str, str]
    project_creation_time: TreeMap[str, str]
    project_total_reviews: TreeMap[str, u256]
    project_reputation_scores: TreeMap[str, u256]
    project_average_stars: TreeMap[str, u256]
    project_names_list: TreeMap[u256, str]
    
    # Reviews with STATUS
    review_project_name: TreeMap[u256, str]
    review_authors: TreeMap[u256, str]
    review_texts: TreeMap[u256, str]
    review_star_ratings: TreeMap[u256, u256]
    review_timestamps: TreeMap[u256, str]
    review_stakes: TreeMap[u256, u256]
    review_helpful_votes: TreeMap[u256, u256]
    review_status: TreeMap[u256, str]  # "approved", "flagged", "spam"
    review_quality_score: TreeMap[u256, u256]  # 0-100
    review_feedback: TreeMap[u256, str]  # Human-readable feedback
    
    # User Profiles
    user_has_profile: TreeMap[str, bool]  # Check if user has created profile
    user_username: TreeMap[str, str]  # Username (must be unique)
    user_bio: TreeMap[str, str]  # User bio/description
    user_avatar_url: TreeMap[str, str]  # Avatar image URL
    user_twitter: TreeMap[str, str]  # Twitter handle
    user_github: TreeMap[str, str]  # GitHub username
    user_website: TreeMap[str, str]  # Personal website
    user_joined_date: TreeMap[str, str]  # When profile was created
    username_to_address: TreeMap[str, str]  # Reverse lookup: username -> address
    
    # Reviewer Wallet & Stats
    reviewer_total_reviews: TreeMap[str, u256]
    reviewer_approved_reviews: TreeMap[str, u256]
    reviewer_flagged_reviews: TreeMap[str, u256]
    reviewer_helpful_count: TreeMap[str, u256]
    reviewer_balance: TreeMap[str, u256]  # Clear "balance" instead of "stake"
    reviewer_total_deposited: TreeMap[str, u256]
    reviewer_total_refunded: TreeMap[str, u256]
    reviewer_total_slashed: TreeMap[str, u256]
    
    # User's Review IDs (for easy lookup) - Flattened structure
    # Key format: "user_address:index" -> review_id
    user_review_id_by_index: TreeMap[str, u256]
    user_review_count: TreeMap[str, u256]
    
    # Transaction History
    transaction_user: TreeMap[u256, str]
    transaction_type: TreeMap[u256, str]  # "deposit", "stake", "refund", "slash", "withdraw"
    transaction_amount: TreeMap[u256, u256]
    transaction_description: TreeMap[u256, str]
    transaction_timestamp: TreeMap[u256, str]
    next_transaction_id: u256
    
    # Counters
    next_review_id: u256
    total_projects: u256
    
    # Configuration
    review_stake_amount: u256
    project_registration_stake: u256
    
    def __init__(self):
        """Initialize ReputedMochi"""
        self.next_review_id = 0
        self.next_transaction_id = 0
        self.total_projects = 0
        self.review_stake_amount = 100
        self.project_registration_stake = 5000  # 5000 GEN to register project
    
    @gl.public.write
    def register_project(
        self,
        owner: str,
        name: str,
        category: str,
        description: str,
        website: str
    ) -> str:
        """Register a new Web3 project"""
        name = name.strip()
        
        if len(name) < 2:
            return "❌ Error: Project name must be at least 2 characters"
        
        if len(name) > 100:
            return "❌ Error: Project name too long (max 100 characters)"
        
        if name in self.project_owners:
            return f"❌ Error: Project '{name}' already exists"
        
        # Check stake requirement
        if owner not in self.reviewer_balance:
            self.reviewer_balance[owner] = 0
        
        if self.reviewer_balance[owner] < self.project_registration_stake:
            needed = self.project_registration_stake - self.reviewer_balance[owner]
            return f"❌ INSUFFICIENT BALANCE\n\n💳 Your Balance: {self.reviewer_balance[owner]} GEN\n💰 Required: {self.project_registration_stake} GEN\n❗ Need {needed} more GEN\n\nProject registration requires {self.project_registration_stake} GEN stake to prevent spam."
        
        # Deduct registration stake
        self.reviewer_balance[owner] -= self.project_registration_stake
        
        # Record transaction
        self._record_transaction(owner, "stake", self.project_registration_stake, f"Project registration stake for '{name}'")
        
        # Store project data
        self.project_owners[name] = owner
        self.project_categories[name] = category
        self.project_descriptions[name] = description
        self.project_websites[name] = website
        self.project_creation_time[name] = gl.message_raw.get("datetime", "")
        self.project_total_reviews[name] = 0
        self.project_reputation_scores[name] = 500
        self.project_average_stars[name] = 30
        self.project_names_list[self.total_projects] = name
        
        self.total_projects += 1
        
        return f"✅ SUCCESS!\n\nProject '{name}' registered\nCategory: {category}\nOwner: {owner}\n\n💰 Stake: {self.project_registration_stake} GEN (held as anti-spam deposit)\n\nYou can now receive reviews!"
    
    @gl.public.write
    def deposit(self, user: str, amount: u256) -> str:
        """Deposit tokens to your balance"""
        if user not in self.reviewer_balance:
            self.reviewer_balance[user] = 0
            self.reviewer_total_deposited[user] = 0
            self.reviewer_total_refunded[user] = 0
            self.reviewer_total_slashed[user] = 0
        
        self.reviewer_balance[user] += amount
        self.reviewer_total_deposited[user] += amount
        
        # Record transaction
        self._record_transaction(user, "deposit", amount, f"Deposited {amount} tokens")
        
        new_balance = self.reviewer_balance[user]
        reviews_possible = new_balance // self.review_stake_amount
        
        return f"✅ DEPOSIT SUCCESS!\n\n💰 Deposited: {amount} tokens\n💳 New Balance: {new_balance} tokens\n📝 Reviews Possible: {reviews_possible}\n\nYou can now submit reviews!"
    
    @gl.public.write
    def create_profile(
        self,
        address: str,
        username: str,
        bio: str,
        avatar_url: str,
        twitter: str,
        github: str,
        website: str
    ) -> str:
        """Create user profile (one-time setup)"""
        # Check if profile already exists
        if address in self.user_has_profile and self.user_has_profile[address]:
            return f"❌ Error: Profile already exists! Use update_profile() to modify."
        
        # Validate username
        username = username.strip()
        if len(username) < 3:
            return "❌ Error: Username must be at least 3 characters"
        if len(username) > 20:
            return "❌ Error: Username too long (max 20 characters)"
        
        # Check if username is already taken
        if username in self.username_to_address:
            return f"❌ Error: Username '{username}' is already taken"
        
        # Validate bio
        if len(bio) > 500:
            return "❌ Error: Bio too long (max 500 characters)"
        
        # Store profile
        self.user_has_profile[address] = True
        self.user_username[address] = username
        self.user_bio[address] = bio
        self.user_avatar_url[address] = avatar_url
        self.user_twitter[address] = twitter
        self.user_github[address] = github
        self.user_website[address] = website
        self.user_joined_date[address] = gl.message_raw.get("datetime", "")
        self.username_to_address[username] = address
        
        return f"✅ PROFILE CREATED!\n\n👤 Username: {username}\n📅 Joined: {self.user_joined_date[address]}\n\nYour profile is now visible to everyone!"
    
    @gl.public.write
    def update_profile(
        self,
        address: str,
        bio: str,
        avatar_url: str,
        twitter: str,
        github: str,
        website: str
    ) -> str:
        """Update user profile (cannot change username)"""
        # Check if profile exists
        if address not in self.user_has_profile or not self.user_has_profile[address]:
            return "❌ Error: Profile does not exist! Use create_profile() first."
        
        # Validate bio
        if len(bio) > 500:
            return "❌ Error: Bio too long (max 500 characters)"
        
        # Update profile (username cannot be changed)
        self.user_bio[address] = bio
        self.user_avatar_url[address] = avatar_url
        self.user_twitter[address] = twitter
        self.user_github[address] = github
        self.user_website[address] = website
        
        username = self.user_username[address]
        return f"✅ PROFILE UPDATED!\n\n👤 Username: {username}\n\nYour profile has been updated successfully!"
    
    @gl.public.write
    def submit_review(
        self,
        reviewer: str,
        project_name: str,
        star_rating: u256,
        review_text: str
    ) -> str:
        """Submit a review for a project"""
        # Validation
        if project_name not in self.project_owners:
            return f"❌ Error: Project '{project_name}' does not exist"
        
        if star_rating < 1 or star_rating > 5:
            return "❌ Error: Star rating must be between 1 and 5"
        
        if len(review_text) < 10:
            return "❌ Error: Review must be at least 10 characters"
        
        # Check balance
        if reviewer not in self.reviewer_balance:
            self.reviewer_balance[reviewer] = 0
        
        current_balance = self.reviewer_balance[reviewer]
        
        if current_balance < self.review_stake_amount:
            needed = self.review_stake_amount - current_balance
            return f"❌ INSUFFICIENT BALANCE\n\n💳 Your Balance: {current_balance} tokens\n💰 Required: {self.review_stake_amount} tokens\n❗ Need {needed} more tokens\n\nPlease deposit more tokens first!"
        
        # Deduct stake
        self.reviewer_balance[reviewer] -= self.review_stake_amount
        
        # Analyze review quality (simple heuristic without AI)
        quality_analysis = self._analyze_review_quality(review_text, star_rating)
        
        # Store review
        review_id = self.next_review_id
        self.review_project_name[review_id] = project_name
        self.review_authors[review_id] = reviewer
        self.review_texts[review_id] = review_text
        self.review_star_ratings[review_id] = star_rating
        self.review_timestamps[review_id] = gl.message_raw.get("datetime", "")
        self.review_stakes[review_id] = self.review_stake_amount
        self.review_helpful_votes[review_id] = 0
        self.review_status[review_id] = quality_analysis["status"]
        self.review_quality_score[review_id] = quality_analysis["score"]
        self.review_feedback[review_id] = quality_analysis["feedback"]
        
        # Track user's reviews (using flattened key structure)
        if reviewer not in self.user_review_count:
            self.user_review_count[reviewer] = 0
        user_review_index = self.user_review_count[reviewer]
        # Store review ID with composite key "address:index"
        composite_key = f"{reviewer}:{user_review_index}"
        self.user_review_id_by_index[composite_key] = review_id
        self.user_review_count[reviewer] += 1
        
        self.next_review_id += 1
        
        # Update reviewer stats
        if reviewer not in self.reviewer_total_reviews:
            self.reviewer_total_reviews[reviewer] = 0
            self.reviewer_approved_reviews[reviewer] = 0
            self.reviewer_flagged_reviews[reviewer] = 0
            self.reviewer_helpful_count[reviewer] = 0
        
        self.reviewer_total_reviews[reviewer] += 1
        
        # Update project reputation
        self._update_project_reputation(project_name, star_rating, quality_analysis["score"])
        
        # Handle stake refund based on quality
        refund_message = ""
        stake_action = ""
        
        if quality_analysis["status"] == "approved":
            # Good review - full refund
            self.reviewer_balance[reviewer] += self.review_stake_amount
            self.reviewer_total_refunded[reviewer] += self.review_stake_amount
            self.reviewer_approved_reviews[reviewer] += 1
            self._record_transaction(reviewer, "stake", self.review_stake_amount, f"Staked for review #{review_id}")
            self._record_transaction(reviewer, "refund", self.review_stake_amount, f"Review approved - full refund")
            refund_message = f"✅ FULL REFUND: {self.review_stake_amount} tokens returned"
            stake_action = "returned"
        elif quality_analysis["status"] == "flagged":
            # Questionable - partial refund (50%)
            partial = self.review_stake_amount // 2
            self.reviewer_balance[reviewer] += partial
            self.reviewer_total_refunded[reviewer] += partial
            self.reviewer_total_slashed[reviewer] += (self.review_stake_amount - partial)
            self.reviewer_flagged_reviews[reviewer] += 1
            self._record_transaction(reviewer, "stake", self.review_stake_amount, f"Staked for review #{review_id}")
            self._record_transaction(reviewer, "refund", partial, f"Review flagged - partial refund (50%)")
            self._record_transaction(reviewer, "slash", self.review_stake_amount - partial, f"Quality penalty")
            refund_message = f"⚠️ PARTIAL REFUND: {partial} tokens returned (50%)"
            stake_action = "partially returned"
        else:
            # Spam - no refund
            self.reviewer_total_slashed[reviewer] += self.review_stake_amount
            self.reviewer_flagged_reviews[reviewer] += 1
            self._record_transaction(reviewer, "stake", self.review_stake_amount, f"Staked for review #{review_id}")
            self._record_transaction(reviewer, "slash", self.review_stake_amount, f"Spam detected - stake slashed")
            refund_message = f"🚫 NO REFUND: Spam detected"
            stake_action = "slashed"
        
        new_balance = self.reviewer_balance[reviewer]
        
        return f"✅ REVIEW SUBMITTED!\n\n" \
               f"📝 Review ID: {review_id}\n" \
               f"🎯 Project: {project_name}\n" \
               f"⭐ Rating: {star_rating}/5\n\n" \
               f"📊 QUALITY ANALYSIS:\n" \
               f"Status: {quality_analysis['status'].upper()}\n" \
               f"Score: {quality_analysis['score']}/100\n" \
               f"Feedback: {quality_analysis['feedback']}\n\n" \
               f"💰 STAKE INFO:\n" \
               f"{refund_message}\n" \
               f"💳 New Balance: {new_balance} tokens\n\n" \
               f"View your review: get_review({review_id})\n" \
               f"View balance: get_my_dashboard(\"{reviewer}\")"
    
    def _analyze_review_quality(self, review_text: str, star_rating: u256) -> dict:
        """
        Simple quality analysis without AI
        Based on length, content, and patterns
        """
        text_length = len(review_text)
        words = len(review_text.split())
        
        # Check for spam patterns
        lower_text = review_text.lower()
        spam_words = ["spam", "test", "asdf", "qwerty", "aaaa", "bbbb"]
        has_spam_word = any(word in lower_text for word in spam_words)
        
        # Calculate quality score
        score = 50  # Start at neutral
        feedback_parts = []
        
        # Length bonus
        if text_length >= 50:
            score += 20
            feedback_parts.append("Good detail")
        elif text_length >= 30:
            score += 10
            feedback_parts.append("Decent length")
        else:
            score -= 10
            feedback_parts.append("Too short")
        
        # Word count bonus
        if words >= 10:
            score += 15
            feedback_parts.append("well-written")
        elif words >= 5:
            score += 5
        else:
            score -= 15
            feedback_parts.append("lacks detail")
        
        # Spam detection
        if has_spam_word:
            score -= 40
            feedback_parts.append("contains spam keywords")
        
        # All caps = shouting
        if review_text.isupper() and text_length > 10:
            score -= 20
            feedback_parts.append("excessive caps")
        
        # Very generic text
        if review_text.lower() in ["good", "bad", "nice", "cool", "ok", "okay"]:
            score -= 30
            feedback_parts.append("too generic")
        
        # Cap score
        if score > 100:
            score = 100
        if score < 0:
            score = 0
        
        # Determine status
        if score >= 70:
            status = "approved"
            feedback = "✅ Quality review! " + ", ".join(feedback_parts) if feedback_parts else "Well done!"
        elif score >= 40:
            status = "flagged"
            feedback = "⚠️ Review needs improvement: " + ", ".join(feedback_parts)
        else:
            status = "spam"
            feedback = "🚫 Low quality: " + ", ".join(feedback_parts)
        
        return {
            "status": status,
            "score": score,
            "feedback": feedback
        }
    
    def _record_transaction(self, user: str, tx_type: str, amount: u256, description: str):
        """Record a transaction in history"""
        tx_id = self.next_transaction_id
        self.transaction_user[tx_id] = user
        self.transaction_type[tx_id] = tx_type
        self.transaction_amount[tx_id] = amount
        self.transaction_description[tx_id] = description
        self.transaction_timestamp[tx_id] = gl.message_raw.get("datetime", "")
        self.next_transaction_id += 1
    
    def _update_project_reputation(self, project_name: str, star_rating: u256, quality_score: u256):
        """Update project's reputation"""
        total_reviews = self.project_total_reviews[project_name]
        current_avg_stars = self.project_average_stars[project_name]
        
        self.project_total_reviews[project_name] = total_reviews + 1
        new_total = total_reviews + 1
        
        # Weighted by quality
        star_rating_scaled = star_rating * 10
        weight = quality_score  # 0-100
        
        new_avg = ((current_avg_stars * total_reviews * 70) + (star_rating_scaled * weight)) // ((total_reviews * 70) + weight)
        self.project_average_stars[project_name] = new_avg
        
        # Update reputation score
        reputation = (new_avg * 20)
        
        if reputation > 1000:
            reputation = 1000
        if reputation < 0:
            reputation = 0
        
        self.project_reputation_scores[project_name] = reputation
    
    @gl.public.write
    def vote_helpful(self, voter: str, review_id: u256) -> str:
        """Vote a review as helpful"""
        if review_id not in self.review_project_name:
            return "❌ Error: Review not found"
        
        self.review_helpful_votes[review_id] += 1
        
        reviewer = self.review_authors[review_id]
        if reviewer in self.reviewer_helpful_count:
            self.reviewer_helpful_count[reviewer] += 1
        
        total = self.review_helpful_votes[review_id]
        
        return f"✅ Voted helpful!\n\n👍 Total helpful votes: {total}\n\nThis helps improve reviewer reputation!"
    
    @gl.public.view
    def get_my_dashboard(self, user: str) -> dict:
        """
        Get user's complete dashboard
        Shows balance, stats, and review history
        """
        if user not in self.reviewer_balance:
            return {
                "balance": 0,
                "reviews_possible": 0,
                "total_reviews": 0,
                "approved_reviews": 0,
                "flagged_reviews": 0,
                "helpful_votes_received": 0,
                "total_deposited": 0,
                "total_refunded": 0,
                "total_slashed": 0,
                "message": "No activity yet. Deposit tokens to start reviewing!"
            }
        
        balance = self.reviewer_balance[user]
        reviews_possible = balance // self.review_stake_amount
        
        return {
            "balance": balance,
            "reviews_possible": reviews_possible,
            "stake_per_review": self.review_stake_amount,
            "total_reviews": self.reviewer_total_reviews.get(user, 0),
            "approved_reviews": self.reviewer_approved_reviews.get(user, 0),
            "flagged_reviews": self.reviewer_flagged_reviews.get(user, 0),
            "helpful_votes_received": self.reviewer_helpful_count.get(user, 0),
            "total_deposited": self.reviewer_total_deposited.get(user, 0),
            "total_refunded": self.reviewer_total_refunded.get(user, 0),
            "total_slashed": self.reviewer_total_slashed.get(user, 0),
            "net_earnings": self.reviewer_total_refunded.get(user, 0) - self.reviewer_total_slashed.get(user, 0)
        }
    
    @gl.public.view
    def get_my_reviews(self, user: str) -> list:
        """Get all reviews by a user"""
        if user not in self.user_review_count:
            return []
        
        reviews = []
        count = self.user_review_count[user]
        
        for i in range(count):
            # Use composite key to lookup review ID
            composite_key = f"{user}:{i}"
            if composite_key in self.user_review_id_by_index:
                review_id = self.user_review_id_by_index[composite_key]
                if review_id in self.review_project_name:
                    reviews.append({
                        "id": review_id,
                        "project": self.review_project_name[review_id],
                        "text": self.review_texts[review_id],
                        "stars": self.review_star_ratings[review_id],
                        "timestamp": self.review_timestamps[review_id],
                        "status": self.review_status[review_id],
                        "quality_score": self.review_quality_score[review_id],
                        "feedback": self.review_feedback[review_id],
                        "helpful_votes": self.review_helpful_votes[review_id],
                        "stake": self.review_stakes[review_id]
                    })
        
        return reviews
    
    @gl.public.view
    def get_my_transactions(self, user: str, limit: u256) -> list:
        """Get user's transaction history"""
        transactions = []
        count = 0
        
        # Iterate backwards (newest first)
        for tx_id in range(self.next_transaction_id):
            if tx_id in self.transaction_user:
                if self.transaction_user[tx_id] == user:
                    transactions.append({
                        "id": tx_id,
                        "type": self.transaction_type[tx_id],
                        "amount": self.transaction_amount[tx_id],
                        "description": self.transaction_description[tx_id],
                        "timestamp": self.transaction_timestamp[tx_id]
                    })
                    count += 1
                    if count >= limit:
                        break
        
        return transactions
    
    @gl.public.view
    def get_review(self, review_id: u256) -> dict:
        """Get detailed review information"""
        if review_id not in self.review_project_name:
            return {"error": "Review not found"}
        
        return {
            "id": review_id,
            "project": self.review_project_name[review_id],
            "author": self.review_authors[review_id],
            "text": self.review_texts[review_id],
            "stars": self.review_star_ratings[review_id],
            "timestamp": self.review_timestamps[review_id],
            "status": self.review_status[review_id],
            "quality_score": self.review_quality_score[review_id],
            "feedback": self.review_feedback[review_id],
            "helpful_votes": self.review_helpful_votes[review_id],
            "stake": self.review_stakes[review_id]
        }
    
    @gl.public.view
    def get_project(self, project_name: str) -> dict:
        """Get project information"""
        if project_name not in self.project_owners:
            return {"error": f"Project '{project_name}' not found"}
        
        return {
            "name": project_name,
            "owner": self.project_owners[project_name],
            "category": self.project_categories[project_name],
            "description": self.project_descriptions[project_name],
            "website": self.project_websites[project_name],
            "creation_time": self.project_creation_time[project_name],
            "total_reviews": self.project_total_reviews[project_name],
            "reputation_score": self.project_reputation_scores[project_name],
            "average_stars": self.project_average_stars[project_name],
            "reputation_level": self._get_reputation_level(self.project_reputation_scores[project_name])
        }
    
    @gl.public.view
    def get_reviews(self, project_name: str, limit: u256) -> list:
        """Get reviews for a project"""
        if project_name not in self.project_owners:
            return []
        
        reviews = []
        count = 0
        
        for review_id in range(self.next_review_id):
            if review_id in self.review_project_name:
                if self.review_project_name[review_id] == project_name:
                    reviews.append({
                        "id": review_id,
                        "project": project_name,
                        "author": self.review_authors[review_id],
                        "text": self.review_texts[review_id],
                        "stars": self.review_star_ratings[review_id],
                        "timestamp": self.review_timestamps[review_id],
                        "status": self.review_status[review_id],
                        "quality_score": self.review_quality_score[review_id],
                        "helpful_votes": self.review_helpful_votes[review_id]
                    })
                    count += 1
                    if count >= limit:
                        break
        
        return reviews
    
    @gl.public.view
    def get_all_projects(self) -> list:
        """Get all projects"""
        projects = []
        
        for i in range(self.total_projects):
            if i in self.project_names_list:
                project_name = self.project_names_list[i]
                projects.append({
                    "name": project_name,
                    "category": self.project_categories[project_name],
                    "total_reviews": self.project_total_reviews[project_name],
                    "reputation_score": self.project_reputation_scores[project_name],
                    "average_stars": self.project_average_stars[project_name],
                    "reputation_level": self._get_reputation_level(self.project_reputation_scores[project_name])
                })
        
        return projects
    
    def _get_reputation_level(self, score: u256) -> str:
        """Convert score to level"""
        if score >= 900:
            return "Legendary"
        elif score >= 800:
            return "Excellent"
        elif score >= 700:
            return "Great"
        elif score >= 600:
            return "Good"
        elif score >= 500:
            return "Average"
        elif score >= 400:
            return "Below Average"
        else:
            return "Poor"
    
    @gl.public.view
    def get_stats(self) -> dict:
        """Get platform statistics"""
        return {
            "total_projects": self.total_projects,
            "total_reviews": self.next_review_id,
            "total_transactions": self.next_transaction_id,
            "review_stake_amount": self.review_stake_amount,
            "project_registration_stake": self.project_registration_stake
        }
    
    @gl.public.view
    def project_exists(self, project_name: str) -> bool:
        """Check if project exists"""
        return project_name in self.project_owners
    
    @gl.public.view
    def get_profile(self, address: str) -> dict:
        """Get user profile by wallet address"""
        if address not in self.user_has_profile or not self.user_has_profile[address]:
            return {
                "error": "Profile not found",
                "has_profile": False,
                "address": address
            }
        
        return {
            "has_profile": True,
            "address": address,
            "username": self.user_username[address],
            "bio": self.user_bio[address],
            "avatar_url": self.user_avatar_url[address],
            "twitter": self.user_twitter[address],
            "github": self.user_github[address],
            "website": self.user_website[address],
            "joined_date": self.user_joined_date[address],
            "total_reviews": self.reviewer_total_reviews.get(address, 0),
            "approved_reviews": self.reviewer_approved_reviews.get(address, 0),
            "helpful_votes": self.reviewer_helpful_count.get(address, 0)
        }
    
    @gl.public.view
    def get_profile_by_username(self, username: str) -> dict:
        """Get user profile by username"""
        if username not in self.username_to_address:
            return {
                "error": "Username not found",
                "has_profile": False
            }
        
        address = self.username_to_address[username]
        return self.get_profile(address)
    
    @gl.public.view
    def username_available(self, username: str) -> bool:
        """Check if username is available"""
        return username not in self.username_to_address
    
    @gl.public.view
    def has_profile(self, address: str) -> bool:
        """Check if user has created a profile"""
        return address in self.user_has_profile and self.user_has_profile[address]
