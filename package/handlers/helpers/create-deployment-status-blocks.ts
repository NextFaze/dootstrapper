export function createDeploymentStatusBlocks({
  body: { title, fields, imgUrl },
  actions,
  footer,
}: {
  body: {
    title: string;
    fields: string[];
    imgUrl?: string;
  };
  actions: { text: string; url: string; style?: 'primary' | 'danger' }[];
  footer: string;
}) {
  const blocks = [];

  const bodySection: { [key: string]: any } = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${title}*`,
    },
  };

  if (fields.length) {
    bodySection.fields = fields.map(field => ({
      type: 'mrkdwn',
      text: field,
    }));
  }

  if (imgUrl) {
    bodySection.accessory = {
      type: 'image',
      image_url: imgUrl,
      alt_text: title,
    };
  }

  blocks.push(bodySection);

  const actionsSection = {
    type: 'actions',
    elements: actions.map(action => {
      const actionElement: { [key: string]: any } = {
        type: 'button',
        text: {
          type: 'plain_text',
          text: action.text,
        },
        url: action.url,
      };
      if (action.style) {
        actionElement.style = action.style;
      }
      return actionElement;
    }),
  };

  blocks.push(actionsSection);

  const footerSection = {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: footer,
      },
    ],
  };
  blocks.push(footerSection);
  return blocks;
}
