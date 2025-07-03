// components/tabs/WorkHistoryTab.tsx
import React from 'react';
import { UserProfileData, WorkHistoryData } from '../../types/profile.types';

interface WorkHistoryTabProps {
  user: UserProfileData;
  workHistory?: WorkHistoryData | null;
  isOwner: boolean;
  onRefresh: () => Promise<void>;
}

const WorkHistoryTab: React.FC<WorkHistoryTabProps> = ({
  user,
  workHistory,
  isOwner,
  onRefresh,
}) => {
  return (
    <div className="work-history-tab">
      <div className="work-history-tab__header">
        <h3>Work History & Projects</h3>
        {isOwner && (
          <button onClick={onRefresh} className="btn btn--secondary">
            Refresh
          </button>
        )}
      </div>

      {workHistory ? (
        <div className="work-history-content">
          <div className="work-history-summary">
            <h4>Summary</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">
                  {workHistory.workSummary?.totalProjects || 0}
                </span>
                <span className="stat-label">Total Projects</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {workHistory.workSummary?.averageRating?.toFixed(1) || 'N/A'}
                </span>
                <span className="stat-label">Average Rating</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {workHistory.workSummary?.completionRate || 0}%
                </span>
                <span className="stat-label">Completion Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  ${workHistory.workSummary?.totalEarnings || 0}
                </span>
                <span className="stat-label">Total Earnings</span>
              </div>
            </div>
          </div>

          {workHistory.recentWork && workHistory.recentWork.length > 0 && (
            <div className="recent-projects">
              <h4>Recent Work</h4>
              <div className="projects-list">
                {workHistory.recentWork.map((work: any, index: number) => (
                  <div key={index} className="project-item">
                    <h5>{work.title}</h5>
                    <p>Category: {work.category}</p>
                    <div className="project-meta">
                      <span className="project-rating">
                        ⭐ {work.clientRating}
                      </span>
                      <span className="project-date">
                        Completed:{' '}
                        {new Date(work.completedAt).toLocaleDateString()}
                      </span>
                      {work.verified && (
                        <span className="project-verified">✓ Verified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {workHistory.skills && workHistory.skills.length > 0 && (
            <div className="skills-section">
              <h4>Skills</h4>
              <div className="skills-list">
                {workHistory.skills.map((skill: any, index: number) => (
                  <div key={index} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{skill.skill}</span>
                      <span className="skill-level">{skill.level}</span>
                    </div>
                    <div className="skill-stats">
                      <span>Score: {skill.score}/100</span>
                      <span>Projects: {skill.projectCount}</span>
                      <span>Rating: ⭐ {skill.averageRating?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="work-history-empty">
          <p>No work history available</p>
        </div>
      )}
    </div>
  );
};

export default WorkHistoryTab;
