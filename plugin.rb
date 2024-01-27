# frozen_string_literal: true

# name: scheduled-reply
# version: 0.2.0
# authors: Muhlis Budi Cahyono (muhlisbc@gmail.com)
# url: https://github.com/muhlisbc/discourse-scheduled-reply-plugin

%i[common desktop mobile].each do |layout|
  register_asset("stylesheets/scheduled-reply/#{layout}.scss", layout)
end

enabled_site_setting(:scheduled_reply_enabled)

after_initialize do
  register_svg_icon("far-clock")
  add_permitted_post_create_param(:scheduled_reply_time)
  register_post_custom_field_type("scheduled_reply_time", :integer)

  add_to_serializer(:post, :scheduled_reply_time) do
    object.custom_fields["scheduled_reply_time"].to_i
  end

  class ::PostsController
    before_action :check_scheduled_reply_time, only: [:create]

    def check_scheduled_reply_time
      if params[:scheduled_reply_time].to_i.positive?
        params[:whisper] = "true"
      end
    end
  end

  on(:post_created) do |post, opts, _user|
    srt = opts[:scheduled_reply_time].to_i

    if srt.positive?
      post.custom_fields["scheduled_reply_time"] = srt
      post.save_custom_fields(true)
      post.publish_change_to_clients!(:revised)

      Jobs.enqueue_in(
        srt.hours,
        :publish_scheduled_reply,
        post_id: post.id,
        opts: opts
      )
    end
  end

  module ::Jobs
    class PublishScheduledReply < ::Jobs::Base
      def execute(args)
        post = Post.with_deleted.find_by(id: args[:post_id])

        return if post.blank?

        creator = post.user

        post.destroy
        post.publish_change_to_clients!(:deleted)

        return if post.deleted_at.present?

        opts = args[:opts]

        opts.delete(:scheduled_reply_time)
        opts.delete(:post_type)

        PostCreator.create!(creator, opts)
      end
    end
  end

  # add staff to whispers groups
  staff_group_id = Group::AUTO_GROUPS[:staff]
  group_ids = SiteSetting.whispers_allowed_groups.to_s.split("|").map(&:to_i)

  if !group_ids.include?(staff_group_id)
    group_ids << staff_group_id

    SiteSetting.whispers_allowed_groups = group_ids.join("|")
  end
end
