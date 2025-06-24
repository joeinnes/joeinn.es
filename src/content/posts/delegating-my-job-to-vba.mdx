---
title: Delegating my Job to VBA
date: 2016-05-07T14:48:00.000Z
date_updated: 2020-03-11T22:25:56.000Z
---

In my work, one of my major embarassments is falling behind my colleagues. I work with one other person on our Knowledge Base, and one of our goals is to have every document reviewed once every 6 months. I’m responsible for making sure that 250 or so articles are up to date, and I’m always falling behind and not being able to keep on top of my follow-ups with knowledge owners.

I’ve had enough of copying and pasting into Outlook, so I decided to write a macro that does the work for me.

Now, I’m no Excel expert, but I can write a little macro. So I started by exporting a list of the articles I’m responsible for from our ticketing tool. The tool allows me to export the HTML body of the article, and the ‘next review date’, as well as the article owner. Unfortunately, there’s no way to pull to article owner’s email address automatically out of the system, so I realised I would need to come up with some additional fields.

I settled on 5 columns at the beginning of the data:

A: Name of reviewer

B: Email address of reviewer

C: To Send?

D: Review due?

E: In progress

The ‘Review due’ field has the simple formula:

```
=IF(H2<TODAY(), TRUE, FALSE)
```

I’m working on row 2 to begin with, and column H contains the ‘Next review date’.

Next up, the formula for the ‘To Send?’ field:

```
=IF(AND(D2, J2<>"", NOT(E2)), TRUE, FALSE)
```

This checks whether the article is due for a review, whether there is text in the article, and whether this is in progress. If the article exists, is not currently in progress, and is pending a review, then this column will be `TRUE`. The reason for the text check is that we currently have a few legacy articles which have their content in a different field. We are working through to fix this, but for the time being, we need to avoid empty emails.

Next, it’s fairly simple — in pseudocode, it looks like this

```
for each non-empty row
  create a new email
set the 'To' field to the article owner's email address
set the 'Subject' to 'Knowledge Review: ' + the article title
set the 'Message' to a template email + the article content
display the email ready to send
next
```

Turns out, Excel lets you create the HTML body of an email really easily. In the end, the entire macro looks like this:

```vba
Sub SendReviewRequest()

Dim OutApp As Object
Dim OutMail As Object
Dim rng As Range

Set OutApp = CreateObject(“Outlook.Application”)
 Dim x As Integer
 ‘ Set numrows = number of rows of data.
 NumRows = Range(“A3”, Range(“A3”).End(xlDown)).Rows.Count

 For x = 2 To NumRows + 2
 If Range(“C” & x + 1).Value = True Then
 Set OutMail = OutApp.createitem(0)
 Sheets(“Raw Data”).Activate
 msg1 = “Dear “ & Range(“A” & x + 1) & “,”
 msg1 = msg1 & “<p>As part of our ongoing knowledge review processes, we have identified that the article below is up for review. Could you please take a look at it, and confirm that the information is correct, or make any necessary modifications and corrections?</p>”
 msg1 = msg1 & “<p>Thank you,</p>”
 msg1 = msg1 & “<p>Joe Innes</p><hr>” & Range(“L” & x + 1).Value

 On Error Resume Next

 With OutMail
 .To = Range(“B” & x + 1)
 .cc = “example@example.com”
 .BCC = “”
 .Subject = “Knowledge Review “ & Range(“H” & x + 1).Value
 .HTMLBody = msg1
 .display
 End With
 ‘ SendKeys “^{ENTER}”
 On Error GoTo 0
 Set OutMail = Nothing
 End If
 Next
Set OutApp = Nothing

End Sub
```

I disabled autosending (the commented line) because I want to manually review each email, and stuck a button on the main worksheet.

Bingo, it works. Once each email is sent, I switch the ‘In progress’ field to `TRUE` to avoid sending the same email, but I’m planning on implementing an auto-incrementing ‘Follow-up’ column that subtly changes the body of the email every time the macro runs, so I can simply run the macro once a week to perform follow-ups as well as reach out to new article owners, but this will already save me hours of work.
