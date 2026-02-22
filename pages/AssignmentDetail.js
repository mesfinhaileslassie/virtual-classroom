// AssignmentDetail 
// Student Submission Section
{isStudent && (
  <Paper sx={{ p: 4 }}>
    <Typography variant="h5" gutterBottom>
      Your Submission
    </Typography>

    {mySubmission ? (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          You submitted this assignment on {format(new Date(mySubmission.submittedAt), 'MMMM dd, yyyy hh:mm a')}
          {mySubmission.status === 'late' && <span> (Late)</span>}
        </Alert>

        <Typography variant="body1" paragraph>
          {mySubmission.content}
        </Typography>

        {mySubmission.attachments?.length > 0 && (
          <>
            <Typography variant="subtitle1">Attachments:</Typography>
            <List>
              {mySubmission.attachments.map((file, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <AttachFile />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={file.fileName}
                    secondary={`${(file.fileSize / 1024).toFixed(2)} KB`}
                  />
                  <Button size="small" href={file.fileUrl} target="_blank">
                    Download
                  </Button>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {mySubmission.grade !== undefined && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle1">
              Grade: {mySubmission.grade}/{currentAssignment.points}
            </Typography>
            {mySubmission.feedback && (
              <Typography variant="body2">
                Feedback: {mySubmission.feedback}
              </Typography>
            )}
          </Alert>
        )}
      </Box>
    ) : (
      <Box>
        {isPastDue ? (
          <Alert severity="error">
            This assignment is past due and no longer accepting submissions.
          </Alert>
        ) : (
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => navigate(`/assignments/${id}/submit`)}
          >
            Submit Assignment
          </Button>
        )}
      </Box>
    )}
  </Paper>
)}

// Teacher View - All Submissions
{isTeacher && currentAssignment.submissions?.length > 0 && (
  <Paper sx={{ p: 4, mt: 3 }}>
    <Typography variant="h5" gutterBottom>
      Submissions ({currentAssignment.submissions.length})
    </Typography>
    <List>
      {currentAssignment.submissions.map((submission, index) => (
        <React.Fragment key={index}>
          <ListItem>
            <ListItemAvatar>
              <Avatar src={submission.student?.profilePicture}>
                {submission.student?.name?.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={submission.student?.name}
              secondary={
                <>
                  Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy hh:mm a')}
                  {submission.status === 'late' && ' • Late'}
                  {submission.grade && ` • Grade: ${submission.grade}/${currentAssignment.points}`}
                </>
              }
            />
            <Button
              variant="outlined"
              onClick={() => navigate(`/assignments/${id}/grade?student=${submission.student?._id}`)}
            >
              {submission.grade ? 'Update Grade' : 'Grade'}
            </Button>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  </Paper>
)}